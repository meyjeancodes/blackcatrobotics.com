-- ============================================================================
-- Widen platforms.type CHECK enum to include medical surgical robots
-- Additive: old values preserved, 'medical_surgical_robot' ADDED.
-- Per repo convention: extend CHECK enum BEFORE inserting new platform rows.
-- ============================================================================

ALTER TABLE platforms DROP CONSTRAINT IF EXISTS platforms_type_check;

ALTER TABLE platforms ADD CONSTRAINT platforms_type_check
  CHECK ((type = ANY (ARRAY[
    'humanoid'::text,
    'quadruped'::text,
    'drone'::text,
    'delivery_ground'::text,
    'delivery_air'::text,
    'warehouse_amr'::text,
    'micromobility'::text,
    'medical_surgical_robot'::text,
    'other'::text
  ])));
