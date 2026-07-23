-- ============================================================================
-- TechMedix Medical Device Telemetry Extension
-- Adds medical-grade surgical robot telemetry columns and tables
-- Run AFTER 001_initial_schema.sql
-- ============================================================================

-- ── EXTENSIONS ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── MEDICAL DEVICE TELEMETRY TABLE ──────────────────────────────────────────
-- Stores high-frequency surgical robot telemetry with medical device semantics
-- Maps to IEEE 11073 SDC and HL7 FHIR device data standards

CREATE TABLE IF NOT EXISTS medical_telemetry (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id        TEXT NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  platform_slug   TEXT NOT NULL,
  timestamp       TIMESTAMPTZ NOT NULL,
  signal_name     TEXT NOT NULL,
  signal_value    NUMERIC,
  unit            TEXT,
  severity        TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  source_device   TEXT,
  raw_payload     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medical_telemetry_robot ON medical_telemetry (robot_id);
CREATE INDEX idx_medical_telemetry_platform ON medical_telemetry (platform_slug);
CREATE INDEX idx_medical_telemetry_signal ON medical_telemetry (signal_name);
CREATE INDEX idx_medical_telemetry_timestamp ON medical_telemetry (timestamp DESC);
CREATE INDEX idx_medical_telemetry_robot_signal ON medical_telemetry (robot_id, signal_name, timestamp DESC);

-- ── EXTEND robots TABLE WITH MEDICAL FIELDS ─────────────────────────────────
-- Add medical-specific columns to the robots table (additive, non-breaking)

ALTER TABLE robots ADD COLUMN IF NOT EXISTS medical_device_id TEXT;
ALTER TABLE robots ADD COLUMN IF NOT EXISTS medical_certification TEXT;
ALTER TABLE robots ADD COLUMN IF NOT EXISTS sterilization_cycle_count INTEGER DEFAULT 0;
ALTER TABLE robots ADD COLUMN IF NOT EXISTS last_sterilization_at TIMESTAMPTZ;
ALTER TABLE robots ADD COLUMN IF NOT EXISTS instrument_usage JSONB DEFAULT '{}'::jsonb;

-- ── MEDICAL DEVICE PROTOCOLS TABLE ──────────────────────────────────────────
-- Tracks which medical data standards each platform supports

CREATE TABLE IF NOT EXISTS medical_device_protocols (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_slug   TEXT NOT NULL,
  protocol_name   TEXT NOT NULL,
  protocol_version TEXT,
  standard_body   TEXT,
  endpoint        TEXT,
  auth_required   BOOLEAN DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medical_protocols_platform ON medical_device_protocols (platform_slug);
CREATE INDEX idx_medical_protocols_name ON medical_device_protocols (protocol_name);

-- ── MEDICAL DEVICE ADAPTERS TABLE ───────────────────────────────────────────
-- Maps vendor-specific data formats to the canonical TechMedix schema
-- This is where IEEE 11073 SDC → FHIR → internal telemetry mapping lives

CREATE TABLE IF NOT EXISTS medical_device_adapters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_slug   TEXT NOT NULL,
  adapter_name    TEXT NOT NULL,
  source_format   TEXT NOT NULL,
  target_format   TEXT NOT NULL,
  mapping_config  JSONB NOT NULL,
  enabled         BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medical_adapters_platform ON medical_device_adapters (platform_slug);
CREATE INDEX idx_medical_adapters_enabled ON medical_device_adapters (enabled);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE medical_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_device_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_device_adapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select" ON medical_telemetry FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON medical_telemetry FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON medical_telemetry FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON medical_telemetry FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON medical_device_protocols FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON medical_device_protocols FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON medical_device_protocols FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON medical_device_protocols FOR DELETE USING (true);

CREATE POLICY "Allow all select" ON medical_device_adapters FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON medical_device_adapters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON medical_device_adapters FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON medical_device_adapters FOR DELETE USING (true);

-- ── SEED: J&J OTTAVA PROTOCOLS ──────────────────────────────────────────────

INSERT INTO medical_device_protocols (platform_slug, protocol_name, protocol_version, standard_body, endpoint, auth_required, notes)
VALUES
  ('jnj_ottava', 'IEEE 11073 SDC', 'ISO/IEEE 11073-10207', 'IEEE/ISO', 'internal://sdc/ottava', true, 'Planned for future firmware. SDC enables cross-manufacturer device-to-device communication in OR.'),
  ('jnj_ottava', 'HL7 FHIR', 'R4', 'HL7 International', 'internal://fhir/ottava', true, 'Planned. Maps device data to FHIR Observation/DeviceUseStatement resources for EHR integration.'),
  ('jnj_ottava', 'J&J MedTech Telemetry API', '2.0', 'Johnson & Johnson MedTech', 'internal://api/ottava-telemetry', true, 'Proprietary real-time telemetry stream. Primary data source until SDC/FHIR are available.')
ON CONFLICT DO NOTHING;

-- ── SEED: J&J OTTAVA ADAPTER MAPPING ────────────────────────────────────────
-- Maps J&J MedTech Telemetry API signals to canonical TechMedix telemetry fields

INSERT INTO medical_device_adapters (platform_slug, adapter_name, source_format, target_format, mapping_config, enabled)
VALUES
(
  'jnj_ottava',
  'J&J Telemetry → TechMedix Canonical',
  'jnj_medtech_telemetry_v2',
  'techmedix_telemetry_v1',
  '{
    "signal_mappings": {
      "arm_joint_torque_nm": {
        "source_field": "armJointTorque",
        "target_field": "arm_joint_torque",
        "unit": "Nm",
        "transform": "float32"
      },
      "instrument_force_n": {
        "source_field": "instrumentForce",
        "target_field": "instrument_force",
        "unit": "N",
        "transform": "float32"
      },
      "cart_position_error_mm": {
        "source_field": "cartPositionError",
        "target_field": "cart_position_error",
        "unit": "mm",
        "transform": "float32"
      },
      "master_input_latency_ms": {
        "source_field": "masterInputLatency",
        "target_field": "console_master_input_latency",
        "unit": "ms",
        "transform": "float32"
      },
      "operational_hours": {
        "source_field": "operationalHours",
        "target_field": "system_operational_hours",
        "unit": "hours",
        "transform": "float32"
      },
      "instrument_usage_count": {
        "source_field": "instrumentUsageCount",
        "target_field": "instrument_usage_count",
        "unit": "count",
        "transform": "uint16"
      }
    },
    "threshold_mappings": {
      "instrument_force": {
        "warning": 20.0,
        "critical": 30.0
      },
      "cart_position_error": {
        "warning": 5.0,
        "critical": 10.0
      },
      "master_input_latency": {
        "warning": 30.0,
        "critical": 50.0
      }
    }
  }'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
