-- Free trial tracking
ALTER TABLE customers ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
