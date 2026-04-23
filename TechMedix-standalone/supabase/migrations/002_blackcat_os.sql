-- BlackCat OS — humanoid robot maintenance platform schema
-- Run after 001_schema.sql

-- ── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE component_type AS ENUM (
    'motor','battery','actuator','sensor','pcb','reducer','hand','bearing'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE criticality_level AS ENUM ('high','medium','low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE procedure_type AS ENUM ('maintenance','replacement','calibration');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE overlay_type AS ENUM ('outline','arrow','highlight');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('pending','in_progress','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Suppliers ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  component_type      text not null,
  website             text,
  unit_price          numeric,
  region              text,
  country             text,
  atlas_supplier_id   text unique,
  market_share        text,
  ticker              text,
  is_bottleneck       boolean default false,
  created_at          timestamptz default now()
);

-- ── BlackCat OS Robots ───────────────────────────────────────────────────────
-- Extends existing robots table with Atlas fields via a separate profile table

CREATE TABLE IF NOT EXISTS robot_profiles (
  id                uuid primary key default gen_random_uuid(),
  robot_id          text references robots(id) on delete cascade,
  model             text not null,
  oem               text not null,
  description       text,
  image_url         text,
  specs             jsonb default '{}',
  atlas_company_id  text,
  created_at        timestamptz default now()
);

-- ── Components ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS components (
  id                  uuid primary key default gen_random_uuid(),
  robot_id            text references robots(id) on delete cascade,
  name                text not null,
  type                component_type not null,
  oem_supplier_id     uuid references suppliers(id) on delete set null,
  cost                numeric,
  availability        text,
  criticality         criticality_level not null default 'medium',
  atlas_component_id  text,
  description         text,
  created_at          timestamptz default now()
);

-- ── Procedures ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS procedures (
  id                    uuid primary key default gen_random_uuid(),
  component_id          uuid references components(id) on delete cascade,
  procedure_type        procedure_type not null,
  title                 text not null,
  steps                 jsonb not null default '[]',
  estimated_minutes     integer,
  ai_guidance_enabled   boolean default true,
  created_at            timestamptz default now()
);

-- ── AR Overlays ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ar_overlays (
  id              uuid primary key default gen_random_uuid(),
  component_id    uuid references components(id) on delete cascade,
  visual_zone     text not null,
  overlay_type    overlay_type not null default 'highlight',
  guidance_steps  jsonb default '[]',
  created_at      timestamptz default now()
);

-- ── Certifications ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certifications (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  level                 int not null unique,
  description           text,
  modules_required      jsonb default '[]',
  simulations_required  int default 0,
  real_repairs_required int default 0,
  ai_score_threshold    numeric default 80,
  created_at            timestamptz default now()
);

-- ── Technician Certifications (many-to-many) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS technician_certifications (
  technician_id     uuid references technicians(id) on delete cascade,
  certification_id  uuid references certifications(id) on delete cascade,
  earned_at         timestamptz default now(),
  ai_score          numeric,
  PRIMARY KEY (technician_id, certification_id)
);

-- ── Jobs ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS jobs (
  id                uuid primary key default gen_random_uuid(),
  robot_id          text references robots(id) on delete set null,
  technician_id     uuid references technicians(id) on delete set null,
  procedure_id      uuid references procedures(id) on delete set null,
  component_id      uuid references components(id) on delete set null,
  status            job_status not null default 'pending',
  timestamps        jsonb default '{}',
  ai_feedback       jsonb default '{}',
  completion_score  numeric,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── AI Agents ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_agents (
  id                        uuid primary key default gen_random_uuid(),
  technician_id             uuid references technicians(id) on delete cascade,
  trained_procedure_ids     uuid[] default '{}',
  voice_enabled             boolean default false,
  realtime_guidance_enabled boolean default true,
  created_at                timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "service_all_suppliers" ON suppliers FOR ALL USING (true);
CREATE POLICY "service_all_robot_profiles" ON robot_profiles FOR ALL USING (true);
CREATE POLICY "service_all_components" ON components FOR ALL USING (true);
CREATE POLICY "service_all_procedures" ON procedures FOR ALL USING (true);
CREATE POLICY "service_all_ar_overlays" ON ar_overlays FOR ALL USING (true);
CREATE POLICY "service_all_certifications" ON certifications FOR ALL USING (true);
CREATE POLICY "service_all_tech_certs" ON technician_certifications FOR ALL USING (true);
CREATE POLICY "service_all_jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "service_all_ai_agents" ON ai_agents FOR ALL USING (true);
