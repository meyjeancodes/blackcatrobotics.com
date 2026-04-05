-- BCR certification program — question bank
-- options is a jsonb array of answer strings; answer_idx is the 0-based correct index

CREATE TABLE IF NOT EXISTS certification_exam_questions (
  id          uuid        primary key default gen_random_uuid(),
  level       text        not null
              check (level in ('L1','L2','L3','L4','L5')),
  question    text        not null,
  options     jsonb       not null,   -- string[]
  answer_idx  integer     not null,   -- 0-based index into options
  created_at  timestamptz default now()
);

CREATE INDEX IF NOT EXISTS certification_exam_questions_level_idx
  ON certification_exam_questions (level, created_at);
