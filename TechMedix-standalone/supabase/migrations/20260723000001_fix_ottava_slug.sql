-- ============================================================================
-- FIX: Ottava platform_slug mismatch in medical tables
-- Source of truth is platforms.slug = 'jnj-ottava' (hyphen, matches atlas
-- convention shared by unitree-g1 / unitree-h1-2). The 20260722 migration
-- seeded the protocol/adapter rows under 'jnj_ottava' (underscore), which
-- would break adapter lookups when real telemetry arrives. Re-key to match.
-- ============================================================================

UPDATE medical_device_protocols
  SET platform_slug = 'jnj-ottava'
  WHERE platform_slug = 'jnj_ottava';

UPDATE medical_device_adapters
  SET platform_slug = 'jnj-ottava'
  WHERE platform_slug = 'jnj_ottava';
