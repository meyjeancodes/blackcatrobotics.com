---
name: BlackCat OS Build
description: New humanoid robot maintenance layer added to TechMedix — AR mode, maintenance jobs, certifications, supplier catalog, all Atlas-sourced
type: project
---

BlackCat OS is a full-stack humanoid robot maintenance platform added to TechMedix-standalone.

**Why:** To extend TechMedix with humanoid-specific tooling: AR-guided maintenance, component sourcing, and technician certification tracking for the Unitree H1.

**How to apply:** When working on any /ar-mode, /maintenance, /certifications, /acquire routes or the blackcat OS schema, refer to this context.

## New Files Added

### Schema
- `supabase/migrations/002_blackcat_os.sql` — suppliers, robot_profiles, components, procedures, ar_overlays, certifications, jobs, ai_agents tables
- `supabase/seed_blackcat_os.sql` — hand-crafted Atlas-sourced seed for Unitree H1 (16 suppliers, 16 components, 15 procedures, 14 AR overlays, 5 cert levels, 3 sample jobs)
- `supabase/seed_atlas_generated.sql` — auto-generated from atlas-to-seed.ts

### Atlas Data (in .atlas/)
- `companies.json` (84 companies), `components.json`, `relationships.json` (Atlas supply chain)
- `unitree_supply_chain.json` — 17 nodes in Unitree's upstream graph
- `unitree_profile.json` — full Unitree G1 spec + 15 supplier relationships

### New Routes
- `app/(dashboard)/ar-mode/page.tsx` — client-side, lazy Supabase init to avoid SSR env errors
- `app/(dashboard)/acquire/page.tsx` — server component with searchParams for type/region filters
- `app/(dashboard)/certifications/page.tsx` — server component, reads certifications + technician_certifications
- `app/(dashboard)/maintenance/page.tsx` — rewritten to use Supabase jobs table
- `app/(dashboard)/maintenance/JobList.tsx` — client component with side panel + AI guidance toggle

### API Routes
- `app/api/ar-guidance/route.ts` — POST, calls claude-sonnet-4-20250514
- `app/api/atlas/[...route]/route.ts` — GET proxy for Atlas API (server-side key)

### Components
- `components/RobotBodySVG.tsx` — SVG front-view Unitree H1 with 12 clickable zones

### Lib
- `lib/atlas.ts` — server-side Atlas API wrapper
- `lib/anthropic.ts` — Anthropic singleton client

### Types
- `types/atlas.ts` — all Atlas API shapes + BlackCat OS DB types

### Scripts
- `scripts/pull-atlas.sh` — re-pulls all Atlas CLI data to .atlas/
- `scripts/atlas-to-seed.ts` — generates SQL from .atlas/ JSON files

### PWA/Mobile
- `public/manifest.json` — BlackCat OS, dark theme
- `public/sw.js` — service worker, cache-first for pages, network-first for API
- `capacitor.config.ts` — scaffolded iOS/Android config

## UUID Convention
Seed UUIDs use single hex letter prefix to indicate table:
- a = ar_overlays
- b = procedures
- c = components (also existing technicians)
- ce = certifications
- d0 = robots, d1 = robot_profiles
- e = jobs
- f = suppliers

## Known: Supabase env vars required for AR mode
The /ar-mode page uses "use client" + lazy Supabase init (inside event handler, not component body) to avoid SSR prerender errors during builds without env vars set.
