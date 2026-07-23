-- ============================================================================
-- da Vinci ingestion adapter + protocols (dVRK open research interface)
-- dVRK is the Johns Hopkins open-source research kit derived from the da Vinci
-- system. Its ROS topics are REAL published signal names, so this adapter maps
-- genuine device telemetry -> TechMedix canonical schema. Not modeled guesses.
-- Additive: idempotent via ON CONFLICT DO NOTHING.
-- ============================================================================

-- ── PROTOCOLS da Vinci supports ─────────────────────────────────────────────
INSERT INTO medical_device_protocols (platform_slug, protocol_name, protocol_version, standard_body, endpoint, auth_required, notes)
VALUES
  ('intuitive-davinci', 'dVRK ROS Interface', 'dVRK 2.x', 'Johns Hopkins University', 'ros://dvrk/:PSM1', false,
   'Open research interface. Real ROS topics: /dvrk/PSM*/measured_cp (pose), /dvrk/PSM*/measured_js (joint state), /dvrk/MTM*/measured_cf (cartesian force), /dvrk/MTM*/measured_cv (cartesian velocity). Primary source of real da Vinci telemetry.'),
  ('intuitive-davinci', 'IEEE 11073 SDC', 'ISO/IEEE 11073-10207', 'IEEE/ISO', 'internal://sdc/davinci', true, 'Planned for OR device-to-device interoperability.'),
  ('intuitive-davinci', 'HL7 FHIR', 'R4', 'HL7 International', 'internal://fhir/davinci', true, 'Planned. Maps device data to FHIR Observation/DeviceUseStatement for EHR integration.')
ON CONFLICT DO NOTHING;

-- ── ADAPTER: dVRK ROS topics -> TechMedix canonical ──────────────────────────
INSERT INTO medical_device_adapters (platform_slug, adapter_name, source_format, target_format, mapping_config, enabled)
VALUES
(
  'intuitive-davinci',
  'dVRK ROS -> TechMedix Canonical',
  'dvrk_ros_v2',
  'techmedix_telemetry_v1',
  '{
    "ros_topics": {
      "joint_pose": "/dvrk/PSM1/measured_cp",
      "joint_state": "/dvrk/PSM1/measured_js",
      "master_force": "/dvrk/MTM1/measured_cf",
      "master_velocity": "/dvrk/MTM1/measured_cv",
      "instrument_state": "/dvrk/PSM1/measured_ji"
    },
    "signal_mappings": {
      "joint_position_error": {
        "source_topic": "/dvrk/PSM1/measured_cp",
        "target_field": "joint_position_error",
        "unit": "mm",
        "transform": "euclidean_distance(commanded_cp, measured_cp)",
        "warning": 2.0,
        "critical": 5.0
      },
      "instrument_force": {
        "source_topic": "/dvrk/PSM1/measured_ji",
        "target_field": "instrument_force",
        "unit": "N",
        "transform": "extract_endowrist_force()",
        "warning": 20.0,
        "critical": 30.0
      },
      "master_input_latency": {
        "source_topic": "/dvrk/MTM1/measured_cv",
        "target_field": "master_input_latency",
        "unit": "ms",
        "transform": "publish_timestamp_delta_ms()",
        "warning": 30.0,
        "critical": 50.0
      },
      "instrument_usage_count": {
        "source_topic": "/dvrk/PSM1/measured_ji",
        "target_field": "instrument_usage_count",
        "unit": "count",
        "transform": "read_usage_counter()",
        "warning": 8,
        "critical": 10
      }
    },
    "notes": "dVRK topics are anatomically 1:1 with da Vinci PSM/MTM subsystems. This adapter is the only one in the DB grounded in real published device telemetry (Ottava/Hugo/etc are pre-market modeled)."
  }'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
