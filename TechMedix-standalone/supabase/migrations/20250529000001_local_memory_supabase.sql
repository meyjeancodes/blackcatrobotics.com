-- Phase 3: Local-first memory tables (Supabase-backed)

create table if not exists repair_history (
  id          bigserial primary key,
  scooter_id  text,
  platform    text,
  fault_code  text,
  summary     text,
  parts_used  jsonb,
  duration_min integer,
  created_at  timestamptz default now()
);

create index if not exists idx_repair_history_scooter_id on repair_history (scooter_id);
create index if not exists idx_repair_history_platform   on repair_history (platform);
create index if not exists idx_repair_history_created_at  on repair_history (created_at desc);

create table if not exists failure_patterns (
  id           bigserial primary key,
  scooter_id   text,
  platform     text,
  fault_code   text,
  symptom      text,
  seen_count   integer default 1,
  last_seen_at timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (scooter_id, fault_code, symptom)
);

create index if not exists idx_failure_patterns_platform on failure_patterns (platform);

create table if not exists ui_prefs (
  key          text primary key,
  value        text not null,
  updated_at   timestamptz default now()
);
