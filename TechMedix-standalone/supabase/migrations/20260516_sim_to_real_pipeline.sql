-- Sim-to-Real Pipeline — Supabase Migration
-- Creates the data pipeline for training robot policies in simulation,
-- deploying zero-shot to real hardware, and closing the feedback loop
-- via fleet telemetry.

-- ─── 1. Pipeline Tasks ─────────────────────────────────────────────────

create table if not exists pipeline_tasks (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  platform_id   text not null,            -- 'unitree-g1', 'spot', etc.
  task_desc     text not null,            -- 'pick and place boxes on conveyor'
  status        text not null default 'pending'
                check (status in ('pending', 'training', 'deploying', 'active', 'failed')),
  created_at    timestamptz not null default now()
);

-- ─── 2. Simulation Runs ────────────────────────────────────────────────

create table if not exists sim_runs (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid not null references pipeline_tasks(id) on delete cascade,
  sim_framework text not null default 'isaac-sim',  -- 'isaac-sim', 'mujoco', etc.
  num_envs      int not null default 48,
  total_steps   int,
  reward_curve  jsonb,                    -- [{step, reward}, ...]
  checkpoint_id uuid,                     -- fk to policy_checkpoints, set after run
  started_at    timestamptz not null default now(),
  completed_at  timestamptz
);

-- ─── 3. Policy Checkpoints ────────────────────────────────────────────

create table if not exists policy_checkpoints (
  id               uuid primary key default gen_random_uuid(),
  sim_run_id       uuid not null references sim_runs(id) on delete cascade,
  version          int not null default 1,
  onnx_path        text,                   -- policy artifact URL (S3 / R2)
  success_rate_sim float,                  -- sim evaluation score (0–1)
  platform_rev     text,                   -- 'g1-firmware-2.1'
  metadata         jsonb,                  -- training params, DR config
  created_at       timestamptz not null default now()
);

-- link back from sim_runs
alter table sim_runs
  add constraint fk_sim_runs_checkpoint
  foreign key (checkpoint_id) references policy_checkpoints(id);

-- ─── 4. Fleet Deployments ─────────────────────────────────────────────

create table if not exists fleet_deployments (
  id              uuid primary key default gen_random_uuid(),
  policy_id       uuid not null references policy_checkpoints(id) on delete cascade,
  robot_id        text not null,
  org_id          uuid not null references organizations(id) on delete cascade,
  deployed_at     timestamptz not null default now(),
  rolled_back_at  timestamptz,
  status          text not null default 'active'
                  check (status in ('active', 'rolled_back', 'failed'))
);

-- ─── 5. Deployment Telemetry (time-series) ────────────────────────────

create table if not exists deployment_telemetry (
  id              uuid primary key default gen_random_uuid(),
  deployment_id   uuid not null references fleet_deployments(id) on delete cascade,
  task_success    boolean,
  cycle_time_ms   float,
  joint_temps     jsonb,                   -- {shoulder_l: 42.0, knee_r: 38.5, ...}
  battery_drain   float,                   -- percentage per task cycle
  error_code      text,
  recorded_at     timestamptz not null default now()
);

-- index for fast time-series queries per deployment
create index if not exists idx_deployment_telemetry_deployment_time
  on deployment_telemetry(deployment_id, recorded_at desc);

-- ─── 6. Sim-Fidelity Scores ───────────────────────────────────────────

create table if not exists sim_fidelity_scores (
  id              uuid primary key default gen_random_uuid(),
  policy_id       uuid not null references policy_checkpoints(id) on delete cascade,
  window_start    date not null,
  window_end      date not null,
  accuracy        float,                   -- real success rate / sim success rate
  drift_flag      boolean not null default false,  -- true if accuracy < 0.85
  computed_at     timestamptz not null default now()
);

create index if not exists idx_sim_fidelity_policy_window
  on sim_fidelity_scores(policy_id, window_start, window_end);

-- ─── 7. Row-Level Security ────────────────────────────────────────────

alter table pipeline_tasks     enable row level security;
alter table sim_runs           enable row level security;
alter table policy_checkpoints enable row level security;
alter table fleet_deployments  enable row level security;
alter table deployment_telemetry enable row level security;
alter table sim_fidelity_scores enable row level security;

-- Each table is scoped to org_id — policies use the org_id column.
-- Replace `auth.uid()` resolution with your org-lookup helper as needed.

create policy "Users can view own org's pipeline tasks"
  on pipeline_tasks for select
  using (org_id = (select org_id from user_roles where user_id = auth.uid() limit 1));

create policy "Users can view own org's sim runs"
  on sim_runs for select
  using (task_id in (select id from pipeline_tasks where org_id = (
    select org_id from user_roles where user_id = auth.uid() limit 1
  )));

create policy "Users can view own org's checkpoints"
  on policy_checkpoints for select
  using (sim_run_id in (
    select sr.id from sim_runs sr
    join pipeline_tasks pt on pt.id = sr.task_id
    where pt.org_id = (select org_id from user_roles where user_id = auth.uid() limit 1)
  ));

create policy "Users can view own org's deployments"
  on fleet_deployments for select
  using (org_id = (select org_id from user_roles where user_id = auth.uid() limit 1));

create policy "Users can view telemetry for own org's deployments"
  on deployment_telemetry for select
  using (deployment_id in (
    select id from fleet_deployments where org_id = (
      select org_id from user_roles where user_id = auth.uid() limit 1
    )
  ));

create policy "Users can view fidelity scores for own org's policies"
  on sim_fidelity_scores for select
  using (policy_id in (
    select pc.id from policy_checkpoints pc
    join sim_runs sr on sr.id = pc.sim_run_id
    join pipeline_tasks pt on pt.id = sr.task_id
    where pt.org_id = (select org_id from user_roles where user_id = auth.uid() limit 1)
  ));
