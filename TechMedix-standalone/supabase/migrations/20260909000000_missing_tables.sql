-- ============================================================================
-- TechMedix Missing Tables Migration
-- Adds chassis, blueprints, knowledge_hub_entries, and parts
-- that the knowledge hub and dashboard surfaces need.
-- Only TechMedix/robotics domain tables.
-- ============================================================================

-- ── EXTENSIONS ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── CHASSIS ─────────────────────────────────────────────────────────
-- Physical chassis registry for robots (separate from platforms/robots)
-- Tracks chassis-level data: build, configuration, wear state
-- ============================================================================
CREATE TABLE IF NOT EXISTS chassis (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id            TEXT NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
  platform_id         UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  chassis_type        TEXT NOT NULL,  -- 'unitree_g1', 'unitree_h1', 'spot', etc.
  serial_number       TEXT NOT NULL,
  build_version       TEXT,
  firmware_version    TEXT,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','maintenance','retired','lost')),
  wear_state          JSONB DEFAULT '{}',  -- wear metrics per component
  last_calibration    TIMESTAMPTZ,
  total_operating_hours NUMERIC(12,2) DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chassis_robot ON chassis(robot_id);
CREATE INDEX IF NOT EXISTS idx_chassis_platform ON chassis(platform_id);
CREATE INDEX IF NOT EXISTS idx_chassis_serial ON chassis(serial_number);
CREATE INDEX IF NOT EXISTS idx_chassis_status ON chassis(status);

-- ── BLUEPRINTS ──────────────────────────────────────────────────────
-- Interactive 3D teardown blueprints linked to platforms/chassis
-- Each blueprint has phases (head, torso, legs, etc.) with part mappings
-- ============================================================================
CREATE TABLE IF NOT EXISTS blueprints (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id         UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  blueprint_name      TEXT NOT NULL,
  blueprint_type      TEXT NOT NULL DEFAULT 'teardown',  -- 'teardown', 'exploded', 'schematic'
  version             TEXT NOT NULL DEFAULT '1.0',
  urdf_path           TEXT,          -- path to URDF file in public/robots/
  mesh_url            TEXT,          -- path to 3D mesh
  phases_json         JSONB NOT NULL DEFAULT '[]',  -- ordered teardown phases
  parts_mapping       JSONB NOT NULL DEFAULT '{}',  -- part name -> component group
  total_parts         INTEGER DEFAULT 0,
  thumbnail_url       TEXT,
  status              TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','published','archived')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blueprints_platform ON blueprints(platform_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_type ON blueprints(blueprint_type);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);

-- ── KNOWLEDGE_HUB_ENTRIES ──────────────────────────────────────────
-- Knowledge Hub content entries (blog posts, guides, tutorials)
-- Linked to platforms, searchable by slug/category
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_hub_entries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT NOT NULL UNIQUE,
  platform_id         UUID REFERENCES platforms(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'guide'
                      CHECK (category IN ('guide','tutorial','blog','reference','case_study','whitepaper')),
  content             TEXT NOT NULL,
  summary             TEXT,
  authors             TEXT[] DEFAULT '{}',
  tags                TEXT[] DEFAULT '{}',
  featured_image      TEXT,
  read_time_minutes   INTEGER DEFAULT 5,
  status              TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','published','archived')),
  seo_title           TEXT,
  seo_description     TEXT,
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_platform ON knowledge_hub_entries(platform_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_hub_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_hub_entries(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_slug ON knowledge_hub_entries(slug);

-- ── PARTS (canonical parts catalog, distinct from parts_inventory) ──
-- Master parts catalog with SKU, supplier, compatibility
-- ============================================================================
CREATE TABLE IF NOT EXISTS parts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name           TEXT NOT NULL,
  part_number         TEXT NOT NULL,
  supplier            TEXT,
  region              TEXT,
  unit_cost_usd       NUMERIC(10,2),
  lead_time_days      INTEGER,
  min_order_qty       INTEGER DEFAULT 1,
  compatibility       TEXT[] DEFAULT '{}',  -- compatible platform slugs
  last_price_update   TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(part_name, part_number, supplier)
);

CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(part_name);
CREATE INDEX IF NOT EXISTS idx_parts_supplier ON parts(supplier);
CREATE INDEX IF NOT EXISTS idx_parts_compat ON parts USING GIN(compatibility);

-- ── TRIGGERS ────────────────────────────────────────────────────────
-- Reuse existing set_updated_at() function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_chassis_updated_at BEFORE UPDATE ON chassis
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_blueprints_updated_at BEFORE UPDATE ON blueprints
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_knowledge_updated_at BEFORE UPDATE ON knowledge_hub_entries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_parts_updated_at BEFORE UPDATE ON parts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── COMMENTS ────────────────────────────────────────────────────────
COMMENT ON TABLE chassis IS 'Physical chassis registry — build/configuration/wear state per robot';
COMMENT ON TABLE blueprints IS 'Interactive 3D teardown blueprints with URDF-linked phases';
COMMENT ON TABLE knowledge_hub_entries IS 'Knowledge Hub content — guides, tutorials, blogs';
COMMENT ON TABLE parts IS 'Master parts catalog with SKU and compatibility';
