-- Seed test customer for BlackCat development
INSERT INTO customers (id, company, name, email, plan, status, fleet_size)
VALUES (
  'test_fleet',
  'BlackCat Test Fleet',
  'BlackCat Test Fleet',
  'blackcatrobotics.ai@gmail.com',
  'operator',
  'active',
  1
) ON CONFLICT (id) DO NOTHING;
