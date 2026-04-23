-- TechMedix / BlackCat OS — full schema
-- Run in Supabase SQL editor or via `supabase db push`

-- ── Customers ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id              uuid primary key default gen_random_uuid(),
  company         text not null,
  name            text not null,
  email           text not null,
  plan            text not null default 'fleet'
                  check (plan in ('operator','fleet','command')),
  status          text not null default 'active'
                  check (status in ('active','trial','inactive')),
  fleet_size      integer not null default 0,
  monthly_spend   numeric(10,2) default 0,
  created_at      timestamptz default now()
);

-- ── Technicians ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS technicians (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  region          text,
  platforms       text[] default '{}',
  rating          numeric(3,1) default 5.0,
  available       boolean default true,
  eta_minutes     integer default 60
);

-- ── Robots ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS robots (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid references customers(id) on delete set null,
  name                text not null,
  platform            text not null,
  serial_number       text,
  location            text not null,
  region              text,
  battery_level       integer not null default 100,
  health_score        integer not null default 100,
  status              text not null default 'online'
                      check (status in ('online','idle','warning','service','offline')),
  telemetry_summary   jsonb default '{}',
  platforms_supported text[] default '{}',
  last_seen_at        timestamptz default now(),
  last_updated        timestamptz default now()
);

-- ── Alerts ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references customers(id) on delete set null,
  robot_id        uuid references robots(id) on delete cascade,
  title           text,
  message         text not null,
  severity        text check (severity in ('critical','warning','info')),
  resolved        boolean default false,
  created_at      timestamptz default now(),
  resolved_at     timestamptz
);

-- ── Dispatch Jobs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dispatch_jobs (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references customers(id) on delete set null,
  robot_id        uuid references robots(id) on delete cascade,
  technician_id   uuid references technicians(id) on delete set null,
  technician_name text,
  description     text not null,
  status          text not null default 'open'
                  check (status in ('open','assigned','en_route','in_service',
                         'onsite','resolved','completed')),
  region          text,
  eta_minutes     integer,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Diagnostic Reports ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id                   uuid primary key default gen_random_uuid(),
  robot_id             uuid references robots(id) on delete cascade,
  summary              text,
  risk_score           integer,
  recommended_protocol text[] default '{}',
  findings             jsonb default '[]',
  raw_output           text,
  created_at           timestamptz default now()
);

-- ── Telemetry Snapshots ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telemetry_snapshots (
  id              uuid primary key default gen_random_uuid(),
  robot_id        uuid references robots(id) on delete cascade,
  timestamp       timestamptz default now(),
  health_score    integer,
  battery_pct     integer,
  motor_temp_c    numeric(5,1),
  joint_wear_pct  integer,
  anomaly_count   integer default 0
);

-- ── Energy States ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS energy_states (
  id               uuid primary key default gen_random_uuid(),
  robot_id         uuid references robots(id) on delete cascade unique,
  battery_level    integer not null,
  consumption_rate numeric(6,2),
  solar_kwh        numeric(6,2) default 0,
  updated_at       timestamptz default now()
);

-- ── Energy Transactions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS energy_transactions (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid references robots(id) on delete set null,
  seller_id      uuid references robots(id) on delete set null,
  kwh            numeric(6,2),
  price_per_kwh  numeric(6,4),
  total_price    numeric(8,2),
  created_at     timestamptz default now()
);

-- ── Tasks ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          uuid primary key default gen_random_uuid(),
  robot_id    uuid references robots(id) on delete cascade,
  type        text check (type in ('charge','inspect','repair','calibrate')),
  priority    integer default 2,
  status      text check (status in ('pending','active','completed'))
              default 'pending',
  created_at  timestamptz default now()
);

-- ── AI Insights Cache ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_insights_cache (
  type        text primary key,
  insight     text,
  updated_at  timestamptz default now()
);

-- ── Realtime ───────────────────────────────────────────────────────────────────
-- Enable realtime publication for live dashboard updates
-- Run these manually in the Supabase dashboard under Database > Replication
-- or uncomment and execute here:
--
-- ALTER PUBLICATION supabase_realtime ADD TABLE robots;
-- ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE dispatch_jobs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE energy_states;
