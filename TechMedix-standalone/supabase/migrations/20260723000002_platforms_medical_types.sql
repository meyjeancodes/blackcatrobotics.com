-- ============================================================================
-- Widen platforms.type CHECK enum for orthopedic + rehab exoskeleton robots
-- Additive: existing values preserved, 'orthopedic_robot' + 'rehab_exoskeleton'
-- ADDED. Per repo convention: extend CHECK enum BEFORE inserting new platforms.
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
    'orthopedic_robot'::text,
    'rehab_exoskeleton'::text,
    'other'::text
  ])));
