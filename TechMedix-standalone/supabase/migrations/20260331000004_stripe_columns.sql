-- Stripe billing columns for customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS subscription_status text default 'inactive';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS plan text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS robot_count int default 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS subscription_start timestamptz;
