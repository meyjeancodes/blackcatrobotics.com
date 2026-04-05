-- BCR certification program — exam submissions
-- Links to enrollment; stores raw answers, computed score, and pass/fail result

CREATE TABLE IF NOT EXISTS certification_exam_submissions (
  id            uuid        primary key default gen_random_uuid(),
  enrollment_id uuid        references certification_enrollments(id) on delete set null,
  email         text        not null,
  level         text        not null
                check (level in ('L1','L2','L3','L4','L5')),
  answers       jsonb       not null,   -- number[] — submitted answer indices
  score         integer     not null,   -- 0–100 percentage
  passed        boolean     not null,
  submitted_at  timestamptz default now()
);

CREATE INDEX IF NOT EXISTS certification_exam_submissions_email_idx
  ON certification_exam_submissions (email, level);

CREATE INDEX IF NOT EXISTS certification_exam_submissions_level_passed_idx
  ON certification_exam_submissions (level, passed);
