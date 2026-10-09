-- Idempotency keys for mutating connector endpoints (dispatch/create, tasks/create).
-- A retried POST with the same Idempotency-Key returns the original response
-- instead of creating a duplicate work order / task.

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key             TEXT NOT NULL,
  route           TEXT NOT NULL,
  customer_id     TEXT,
  response_status INTEGER,
  response_body   JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
  PRIMARY KEY (key, route)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);
