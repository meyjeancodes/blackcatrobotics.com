-- Seed test customer for BlackCat development
INSERT INTO customers (name, email, api_key, subscription_status, plan, robot_count)
VALUES (
  'BlackCat Test Fleet',
  'blackcatrobotics.ai@gmail.com',
  'bcat_test_' || substr(md5(random()::text), 1, 16),
  'active',
  'fleet',
  1
) ON CONFLICT DO NOTHING;
