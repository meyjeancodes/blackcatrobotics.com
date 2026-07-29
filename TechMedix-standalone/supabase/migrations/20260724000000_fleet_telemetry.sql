-- ═══════════════════════════════════════════════════════════════════
-- TechMedix Fleet Telemetry & Device Registry (fleet-learning layer)
-- ═══════════════════════════════════════════════════════════════════
-- Additive ONLY: creates new tables + 1 view + 1 function.
-- No ALTER of existing tables. No change to any existing CHECK enum.
-- Mirrors the Tesla fleet-learning method:
--   1. register physical units (device_inventory)
--   2. stream per-device telemetry events (device_telemetry)
--   3. roll real-world observations back into failure_modes
--      (failure_mode_observations + rollup_fleet_observations())
--   4. expose a fleet-health view for the hero callout
-- RLS: intentionally OFF, consistent with the knowledge layer
--      (platforms / failure_modes / predictive_signals are not RLS-gated).
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Device Inventory (physical units in the field) ────────────────
create table if not exists device_inventory (
  id                    uuid primary key default gen_random_uuid(),
  platform_id           uuid not null references platforms(id) on delete restrict,
  serial_number         text not null unique,
  asset_tag             text,
  status                text not null default 'active'
                        check (status in ('active','idle','maintenance','retired','lost')),
  owner_org             text,                -- customer / hospital / site label (free text, no FK)
  location              text,
  firmware_version      text,
  deployed_at           timestamptz,
  last_seen_at          timestamptz default now(),
  total_operating_hours numeric(12,2) default 0,
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_device_inventory_platform on device_inventory(platform_id);
create index if not exists idx_device_inventory_status   on device_inventory(status);
create index if not exists idx_device_inventory_serial   on device_inventory(serial_number);

-- ─── 2. Device Telemetry (fleet-learning event stream) ────────────────
create table if not exists device_telemetry (
  id               uuid primary key default gen_random_uuid(),
  device_id        uuid not null references device_inventory(id) on delete cascade,
  failure_mode_id  uuid references failure_modes(id) on delete set null,
  event_type       text not null
                   check (event_type in ('heartbeat','status','metric','error','maintenance')),
  severity         text default 'info'
                   check (severity in ('critical','high','medium','low','info')),
  event_code       text,                  -- e.g. 'E-0421', 'BAT_LOW'
  metric_name      text,                  -- e.g. 'motor_temp_c', 'battery_pct'
  metric_value     numeric,
  metric_unit      text,
  payload          jsonb default '{}',
  source           text default 'device', -- 'device' | 'edge' | 'manual'
  reported_at      timestamptz not null default now()
);

create index if not exists idx_device_telemetry_device_time
  on device_telemetry(device_id, reported_at desc);
create index if not exists idx_device_telemetry_failure
  on device_telemetry(failure_mode_id);
create index if not exists idx_device_telemetry_type_time
  on device_telemetry(event_type, reported_at desc);

-- ─── 3. Failure Mode Observations (real-world rollup → hero callout) ───
create table if not exists failure_mode_observations (
  id                  uuid primary key default gen_random_uuid(),
  failure_mode_id     uuid not null references failure_modes(id) on delete cascade,
  observation_count   bigint not null default 0,
  affected_devices    integer not null default 0,
  first_observed_at   timestamptz,
  last_observed_at    timestamptz,
  observed_mtbf_hours numeric(12,2),       -- recomputed from real fleet data
  observed_severity   text
                      check (observed_severity in ('critical','high','medium','low')),
  confidence_shift    text default 'none'
                      check (confidence_shift in ('up','down','none')),
  updated_at          timestamptz default now(),
  unique (failure_mode_id)
);

create index if not exists idx_fmo_failure on failure_mode_observations(failure_mode_id);

-- ─── 4. Rollup function: telemetry → failure_mode_observations ────────
create or replace function rollup_fleet_observations()
returns void
language plpgsql
as $$
begin
  -- Aggregate error/maintenance events tagged to a failure mode
  insert into failure_mode_observations
    (failure_mode_id, observation_count, affected_devices, first_observed_at, last_observed_at)
  select
    t.failure_mode_id,
    count(*)::bigint,
    count(distinct t.device_id)::integer,
    min(t.reported_at),
    max(t.reported_at)
  from device_telemetry t
  where t.failure_mode_id is not null
  group by t.failure_mode_id
  on conflict (failure_mode_id) do update set
    observation_count = excluded.observation_count,
    affected_devices   = excluded.affected_devices,
    first_observed_at  = excluded.first_observed_at,
    last_observed_at   = excluded.last_observed_at,
    updated_at         = now();

  -- Recompute observed MTBF = total fleet operating hours / observations
  update failure_mode_observations fmo
  set observed_mtbf_hours = (
    select case
             when fmo.observation_count > 0
               then sum(di.total_operating_hours) / fmo.observation_count
             else null
           end
    from device_inventory di
    join device_telemetry dt on dt.device_id = di.id
    where dt.failure_mode_id = fmo.failure_mode_id
  )
  where fmo.observation_count > 0;
end;
$$;

-- ─── 5. View: platform fleet health (hero callout source) ────────────
create or replace view v_platform_fleet_health as
select
  p.id                as platform_id,
  p.slug,
  p.name,
  p.manufacturer,
  p.techmedix_status,
  count(distinct di.id)                                       as device_count,
  count(distinct case when di.status = 'active' then di.id end) as active_devices,
  count(fm.id)                                                as failure_mode_count,
  coalesce(sum(fmo.observation_count), 0)::bigint             as total_observations,
  max(fmo.last_observed_at)                                   as last_observation_at
from platforms p
left join device_inventory      di on di.platform_id      = p.id
left join failure_modes         fm on fm.platform_id      = p.id
left join failure_mode_observations fmo on fmo.failure_mode_id = fm.id
group by p.id, p.slug, p.name, p.manufacturer, p.techmedix_status;

-- ─── 6. updated_at triggers (reuse existing function) ─────────────────
do $$ begin
  create trigger trg_device_inventory_updated_at
    before update on device_inventory
    for each row execute function update_updated_at_column();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_failure_mode_observations_updated_at
    before update on failure_mode_observations
    for each row execute function update_updated_at_column();
exception when duplicate_object then null; end $$;

-- ─── 7. Comments ──────────────────────────────────────────────────────
comment on table device_inventory is 'Physical TechMedix units deployed in the field, linked to a platform';
comment on table device_telemetry is 'Fleet-learning event stream per device: heartbeat, status, metrics, errors';
comment on table failure_mode_observations is 'Aggregated real-world observations per failure mode — feeds the hero callout';
comment on view v_platform_fleet_health is 'One-row-per-platform fleet health summary for dashboards and the hero teardown';
