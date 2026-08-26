-- user_profiles: align schema with application usage.
-- The app (signup, onboarding, getDashboardData) reads/writes user_id and
-- customer_id; the table was created without them, breaking the entire
-- auth -> customer chain (logins landed nowhere, dashboards fell back to mock).

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE,
  ADD COLUMN IF NOT EXISTS customer_id text;

-- Backfill/unique index for fast lookup by auth uid
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);

COMMENT ON COLUMN user_profiles.user_id IS 'auth.users.id for this profile';
COMMENT ON COLUMN user_profiles.customer_id IS 'customers.id this operator belongs to';
