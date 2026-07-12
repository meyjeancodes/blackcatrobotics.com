-- ═══════════════════════════════════════════════════════════════════════════════
-- Robotics category-proof case studies (Lely Discovery Collector, DEWALT DALE)
-- Source: verified public announcements (Lely product page, DEWALT/PRNewswire Jul 9 2026)
-- Adds two platforms that validate TechMedix fleet-observability KPIs:
--   - outcome-linked metrics (Lely: cow health -> milk yield)
--   - fleet task/accuracy/battery/schedule-impact telemetry (DALE)
--
-- Self-contained + constraint-safe: extends the existing CHECK constraints on
-- platforms.type and platforms.techmedix_status BEFORE inserting, so it cannot
-- violate the enum and abort the migration.
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1) Widen platforms.type to include the two new verticals
ALTER TABLE platforms DROP CONSTRAINT IF EXISTS platforms_type_check;
ALTER TABLE platforms ADD CONSTRAINT platforms_type_check
  CHECK (type IN (
    'humanoid','quadruped','drone','delivery_ground',
    'delivery_air','warehouse_amr','micromobility','other',
    'agri_robot','construction_robot'
  ));

-- 2) Widen platforms.techmedix_status to include category_proof
ALTER TABLE platforms DROP CONSTRAINT IF EXISTS platforms_techmedix_status_check;
ALTER TABLE platforms ADD CONSTRAINT platforms_techmedix_status_check
  CHECK (techmedix_status IN ('supported','beta','roadmap','deprecated','category_proof'));

-- 3) Seed the case studies
INSERT INTO platforms (slug, name, manufacturer, type, introduced_year, specs_json, techmedix_status, notes) VALUES

-- ── Agriculture robotics ──────────────────────────────────────────────────────
('lely-discovery-collector',
 'Lely Discovery Collector',
 'Lely',
 'agri_robot',
 2021,
 '{"floor_type":"solid_non_slatted","cleaning_method":"vacuum_suction","navigation":"built_in_sensors_autonomous","charging":"wireless_pad_dump_station","app":"android_route_scheduling","disturbance":"low_hindrance_cable_free","sand_flush":"optional_accessory","outcome_claim":"cleaner_hooves_udders_tails_fewer_infections_higher_milk_yield"}',
 'category_proof',
 'Barn manure-collection robot. Vacuums instead of scraping. Proof point for TechMedix outcome-panel pattern: robot activity -> cow health -> milk yield. Outcome claim is vendor-stated, unverified.'),

-- ── Construction robotics ───────────────────────────────────────────────────────
('dewalt-dale',
 'DEWALT DALE',
 'DEWALT (Stanley Black & Decker) x August Robotics',
 'construction_robot',
 2026,
 '{"task":"downward_drilling","fleet_capable":true,"pilot_holes_drilled":230000,"pilot_accuracy_pct":99.97,"speed_vs_traditional":10,"weeks_saved_pilot":190,"pilot_phases":26,"battery":"fast_swap","remote_monitoring":true,"qa":"ai_enhanced","dust_extraction":"automatic","use":"data_center_concrete_floor_mep_prep"}',
 'category_proof',
 'World''s first fleet-capable downward drilling robot for data-center construction. Commercially launched 2026-07-09. Literal TechMedix fleet-observability customer shape: remote monitoring + per-robot QA telemetry + schedule-impact KPIs.')

ON CONFLICT (slug) DO UPDATE SET
  specs_json = EXCLUDED.specs_json,
  techmedix_status = EXCLUDED.techmedix_status,
  notes = EXCLUDED.notes,
  updated_at = now();
