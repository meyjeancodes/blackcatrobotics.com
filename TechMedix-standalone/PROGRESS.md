# TechMedix Knowledge Moat — Build Progress

**Started:** 2026-04-04  
**Agent:** BlackCat Autonomous Build & Ops Agent  
**TypeScript:** ✅ Zero errors

---

## LAYER 1 — Web Intelligence Research Loop

| Platform | Status | Notes |
|---|---|---|
| Unitree G1 | ✅ Data ready | 8 failure modes, full protocols — scripts/research-data/humanoids-quadrupeds.json |
| Unitree H1-2 | ✅ Data ready | 8 failure modes, full protocols — scripts/research-data/humanoids-quadrupeds.json |
| Unitree B2 | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/humanoids-quadrupeds.json |
| Boston Dynamics Spot | ✅ Data ready | 8 failure modes, full protocols — scripts/research-data/humanoids-quadrupeds.json |

| Figure 02 | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/ground-delivery-humanoids.json |
| Tesla Optimus | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/ground-delivery-humanoids.json |
| DJI Agras T50 | ✅ Data ready | 8 failure modes, full protocols — scripts/research-data/drones.json |
| DJI Agras T60 | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/drones.json |
| DJI Matrice 350 RTK | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/drones.json |
| Skydio X10 | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/drones.json |
| Zipline P2 | ✅ Data ready | 7 failure modes, full protocols — scripts/research-data/drones.json |
| Serve RS2 | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/ground-delivery-humanoids.json |
| Starship Gen3 | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/ground-delivery-humanoids.json |
| Amazon Proteus | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/ground-delivery-humanoids.json |
| Lime Gen4 | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/ground-delivery-humanoids.json |
| RadCommercial | ✅ Data ready | 6 failure modes, full protocols — scripts/research-data/ground-delivery-humanoids.json |
| Asimov Here Be Dragons | ⚠️ Skipped | Low-confidence / insufficient data — omitted from initial seed |

**Research pipeline:** All 3 waves complete — all data marked `confidence: "low"`, `source_urls: ["unverified-training-data"]`  
**JSON files:** `scripts/research-data/humanoids-quadrupeds.json` (4 platforms), `scripts/research-data/drones.json` (5 platforms), `scripts/research-data/ground-delivery-humanoids.json` (7 platforms)  
**Weekly cron:** Every Monday 03:00 UTC → `GET /api/techmedix/research/run` (live Serper + Claude research replaces unverified data)

---

## LAYER 2 — Database Population

- ✅ Migration: `supabase/migrations/20260404_knowledge_moat.sql`
  - Tables: `platforms`, `failure_modes`, `repair_protocols`, `predictive_signals`, `suppliers`, `research_log`, `agent_runs`
  - All indexes and triggers included
- ✅ Seed: `supabase/seed_knowledge_platforms.sql` — 17 platforms with specs
- ✅ Seed: `supabase/seed_knowledge_failuremodes.sql` — Failure modes, protocols, signals, suppliers (10 platforms, 15 failure modes, full repair protocols)
- ✅ Query layer: `lib/blackcat/knowledge/db.ts` — all CRUD functions
- ✅ Research engine: `lib/blackcat/research/web-researcher.ts` — Serper + Claude extraction (pre-existing, now integrated)
- ⏳ Run migration in Supabase + seed platforms

**To apply:**
```sql
-- In Supabase SQL editor:
-- 1. Run: supabase/migrations/20260404_knowledge_moat.sql
-- 2. Run: supabase/seed_knowledge_platforms.sql
-- 3. Set env var: SERPER_API_KEY=<your key>
-- 4. POST /api/techmedix/research/run (with x-blackcat-secret) to ingest live data
```

---

## LAYER 3 — App Operations

### API Routes
- ✅ `GET /api/techmedix` — Full catalog (platforms + failure modes + protocols)
- ✅ `GET /api/techmedix?slim=1` — Platform list only
- ✅ `GET /api/techmedix?type=humanoid` — Filtered by type
- ✅ `GET /api/techmedix/platforms` — Lightweight platform list
- ✅ `GET /api/techmedix/platforms/[id]/failure-modes` — Per-platform failures (supports UUID or slug)
- ✅ `GET /api/techmedix/failure-modes/[id]/protocol` — Repair protocol + predictive signals
- ✅ `POST /api/techmedix/research/ingest` — Research agent ingestion endpoint
- ✅ `GET/POST /api/techmedix/research/run` — Weekly research runner (cron + manual)

### Components
- ✅ `components/repair-protocol-viewer.tsx` — Interactive step-by-step repair guide with progress tracking
- ✅ `components/predictive-alert-feed.tsx` — Live predictive failure signal feed

### Dashboard Pages
- ✅ `app/(dashboard)/knowledge/page.tsx` — Platform catalog by type with critical failure summary
- ✅ `app/(dashboard)/knowledge/[slug]/page.tsx` — Per-platform: specs, failure modes, protocol preview
- ✅ `components/sidebar.tsx` — "Knowledge Moat" nav link added
- ✅ `app/(dashboard)/dispatch/DispatchJobCard.tsx` — "Repair Protocol" button wired inline

### Cron
- ✅ `vercel.json` — Weekly research cron: `0 3 * * 1` (Monday 03:00 UTC)

### Signal Feed
- ✅ `components/signal-feed.tsx` — Already wired to `research_log` table (pre-existing); TypeScript fix applied

---

## Required Env Vars (add to .env.local + Vercel)

```bash
SERPER_API_KEY=          # Google Search via serper.dev — needed for research loop
ANTHROPIC_API_KEY=       # Already in use for AI insights — also needed for research
```

---

## Blockers

1. **Supabase not connected** — `NEXT_PUBLIC_SUPABASE_URL` not set → everything runs in mock mode
2. **SERPER_API_KEY not set** — research agent falls back to demo mode (no live search)
3. **Migration not applied** — new tables don't exist yet in DB

---

## Next Steps (operator)

1. Connect Supabase: set `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. Run migrations: `supabase db push` or paste SQL in Supabase SQL editor
3. Seed platforms: run `seed_knowledge_platforms.sql`
4. Add `SERPER_API_KEY` (free tier at serper.dev)
5. Trigger first research run: `POST /api/techmedix/research/run` with `x-blackcat-secret`
6. Enable Supabase Realtime on new tables if live push wanted
7. Redeploy to Vercel to activate Monday cron

---

## Architecture Summary

```
blackcatrobotics.com / TechMedix Dashboard
         │
         ├── /knowledge             ← Platform catalog (17 robots)
         │   └── /[slug]            ← Per-platform failure modes + repair protocols
         │
         ├── /dispatch              ← Job cards now include "Repair Protocol" button
         │
         └── /dashboard             ← Signal feed shows research_log entries
         
API Layer (all under /api/techmedix/)
         ├── GET  /                 ← Full catalog
         ├── GET  /platforms        ← Slim list
         ├── GET  /platforms/[id]/failure-modes
         ├── GET  /failure-modes/[id]/protocol
         ├── POST /research/ingest  ← Agent data ingestion
         └── GET|POST /research/run ← Runs research loop (cron: Mon 03:00 UTC)

DB (Supabase PostgreSQL)
         ├── platforms              ← 17 robot platforms
         ├── failure_modes          ← Failure catalog with citations
         ├── repair_protocols       ← Step-by-step technician guides
         ├── predictive_signals     ← Telemetry thresholds → failure prediction
         ├── suppliers              ← Part sourcing data
         ├── research_log           ← Source audit trail
         └── agent_runs             ← Research run history

Research Loop
         web-researcher.ts → Serper API (search) → Claude claude-sonnet-4-6 (extract)
         → upsertFailureMode / insertRepairProtocol / insertPredictiveSignal
         → research_log (citation audit)
         → agent_runs (run tracking)
```
