-- TechMedix connector API keys (per-customer Bearer tokens).
-- Only the SHA-256 hash is stored; plaintext keys are shown once at mint time.

CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash     TEXT NOT NULL UNIQUE,          -- SHA-256 hex of the full key
  key_prefix   TEXT NOT NULL,                 -- first 12 chars, for identification in dashboards
  customer_id  TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT 'default',
  revoked_at   TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_customer ON api_keys(customer_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
