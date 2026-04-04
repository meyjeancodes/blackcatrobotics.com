-- ═══════════════════════════════════════════════════════════════════════════════
-- TechMedix Knowledge Moat — Migration 20260404
-- Failure mode catalog, repair protocols, predictive signals, suppliers
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Platforms ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platforms (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,              -- e.g. 'unitree-g1'
  name                text not null,                     -- e.g. 'Unitree G1'
  manufacturer        text not null,
  type                text not null check (type in (
                        'humanoid','quadruped','drone','delivery_ground',
                        'delivery_air','warehouse_amr','micromobility','other'
                      )),
  introduced_year     integer,
  specs_json          jsonb default '{}',               -- weight, DOF, battery_wh, etc.
  techmedix_status    text not null default 'supported'
                      check (techmedix_status in ('supported','beta','roadmap','deprecated')),
  image_url           text,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_platforms_type ON platforms(type);
CREATE INDEX IF NOT EXISTS idx_platforms_manufacturer ON platforms(manufacturer);

-- ── Failure Modes ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS failure_modes (
  id                  uuid primary key default gen_random_uuid(),
  platform_id         uuid not null references platforms(id) on delete cascade,
  component           text not null,                    -- e.g. 'knee actuator'
  symptom             text not null,
  root_cause          text not null,
  severity            text not null default 'medium'
                      check (severity in ('critical','high','medium','low')),
  mtbf_hours          integer,                          -- mean time between failures
  source_urls         text[] default '{}',              -- citations
  source_count        integer generated always as (array_length(source_urls, 1)) stored,
  confidence          text not null default 'medium'
                      check (confidence in ('high','medium','low','unverified')),
  -- confidence auto-derived: set to 'low' if source_count < 3
  tags                text[] default '{}',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_failure_modes_platform ON failure_modes(platform_id);
CREATE INDEX IF NOT EXISTS idx_failure_modes_severity ON failure_modes(severity);
CREATE INDEX IF NOT EXISTS idx_failure_modes_component ON failure_modes(component);

-- ── Repair Protocols ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS repair_protocols (
  id                  uuid primary key default gen_random_uuid(),
  failure_mode_id     uuid not null references failure_modes(id) on delete cascade,
  title               text not null,
  steps_json          jsonb not null default '[]',
  -- steps format: [{ step: 1, action: text, tool: text|null, warning: text|null, image_hint: text|null }]
  tools_required      text[] default '{}',
  parts_json          jsonb default '[]',
  -- parts format: [{ part_name, part_number, supplier, unit_cost_usd, qty }]
  labor_minutes       integer,
  skill_level         text not null default 'intermediate'
                      check (skill_level in ('basic','intermediate','advanced','specialist')),
  source_url          text,
  verified_by         text,                             -- technician ID or 'research_agent'
  version             integer not null default 1,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_repair_protocols_failure ON repair_protocols(failure_mode_id);

-- ── Predictive Signals ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS predictive_signals (
  id                  uuid primary key default gen_random_uuid(),
  failure_mode_id     uuid not null references failure_modes(id) on delete cascade,
  signal_name         text not null,                    -- e.g. 'joint_torque_variance'
  signal_source       text,                             -- e.g. 'CAN bus', 'IMU', 'motor controller'
  threshold_value     numeric,
  threshold_operator  text default '>' check (threshold_operator in ('>','<','>=','<=','==')),
  threshold_unit      text,                             -- e.g. 'Nm', 'celsius', 'percent'
  lead_time_hours     integer,                          -- how far ahead this signal appears
  confidence          numeric(3,2) check (confidence between 0 and 1),
  notes               text,
  created_at          timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_predictive_signals_failure ON predictive_signals(failure_mode_id);

-- ── Suppliers ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  website             text,
  region              text not null,                    -- 'NA','EU','APAC','CN','global'
  component_types     text[] default '{}',              -- e.g. ['actuator','motor','battery']
  platforms_served    text[] default '{}',              -- platform slugs
  unit_cost_usd       numeric(10,2),
  lead_time_days      integer,
  min_order_qty       integer default 1,
  risk_level          text default 'medium'
                      check (risk_level in ('low','medium','high')),
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_region ON suppliers(region);
CREATE INDEX IF NOT EXISTS idx_suppliers_risk ON suppliers(risk_level);

-- ── Research Log ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_log (
  id                  uuid primary key default gen_random_uuid(),
  platform_id         uuid references platforms(id) on delete set null,
  source_url          text not null,
  source_type         text check (source_type in (
                        'manufacturer_doc','teardown','forum','arxiv',
                        'patent','service_bulletin','news','youtube','other'
                      )),
  content_summary     text,
  extracted_data      jsonb default '{}',
  agent_run_id        text,                             -- for grouping by research run
  extracted_at        timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_research_log_platform ON research_log(platform_id);
CREATE INDEX IF NOT EXISTS idx_research_log_extracted ON research_log(extracted_at);

-- ── Triggers: updated_at ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER trg_platforms_updated_at
    BEFORE UPDATE ON platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_failure_modes_updated_at
    BEFORE UPDATE ON failure_modes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_repair_protocols_updated_at
    BEFORE UPDATE ON repair_protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Comments ───────────────────────────────────────────────────────────────────
COMMENT ON TABLE platforms IS 'Robot platform catalog — all platforms supported or tracked by TechMedix';
COMMENT ON TABLE failure_modes IS 'Known failure modes per platform component, with severity and source citations';
COMMENT ON TABLE repair_protocols IS 'Step-by-step technician repair instructions for each failure mode';
COMMENT ON TABLE predictive_signals IS 'Telemetry signals that predict each failure mode, with lead time and confidence';
COMMENT ON TABLE suppliers IS 'Part suppliers for repair, with region, cost, and lead time';
COMMENT ON TABLE research_log IS 'Audit log of all web research runs and data extracted';

-- ── Agent Runs ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_runs (
  id                  text primary key default gen_random_uuid()::text,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  platforms_processed jsonb default '[]',
  records_inserted    integer not null default 0,
  status              text not null default 'running'
                      check (status in ('running','completed','failed','partial')),
  error_message       text
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON agent_runs(started_at desc);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status  ON agent_runs(status);

COMMENT ON TABLE agent_runs IS 'Tracks each autonomous research agent execution and its results';
