-- Extra columns for customer onboarding and API access
ALTER TABLE customers ADD COLUMN IF NOT EXISTS api_key text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS onboarding_complete boolean default false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS work_email text;
