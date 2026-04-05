-- BCR certification program — enrollment capture
-- Stores public sign-ups before or after exam submission

CREATE TABLE IF NOT EXISTS certification_enrollments (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null,
  name        text,
  level       text        not null
              check (level in ('L1','L2','L3','L4','L5')),
  enrolled_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS certification_enrollments_email_idx
  ON certification_enrollments (email);

CREATE INDEX IF NOT EXISTS certification_enrollments_level_idx
  ON certification_enrollments (level);
