# BlackCat Grid — Product Spec (v0.1, scope proposal)

> Context: HABITAT (homes) and the Store (parts) are real. Grid is currently
> marketing-only (full static page + `api/grid/run` + `api/grid/state` stubs).
> This spec scopes a REAL Grid product so the "infrastructure for the autonomous
> economy" claim becomes true, not copy.

## Thesis
Grid is the infrastructure-intelligence layer that makes a HABITAT home (and any
autonomous site) actually run: energy, compute, network, and robotics coordination —
monitored and maintained by the same BlackCat OS that runs TechMedix.

## Why now (from competitive scan)
Competitors (ICON, Apis Cor) sell the BUILD but leave the owner to figure out power,
connectivity, and upkeep. Grid closes that gap and reuses TechMedix's telemetry + alerting
engine. It is the connective tissue between HABITAT (homes) and the Store (parts).

## Scope — Phase 1 (MVP, 2–3 weeks)
1. Grid Status dashboard (`/grid`, new Next.js route)
   - Reads `api/grid/state` (exists as stub) -> solar output, battery state, grid
     exchange, network health, connected-robot fleet count.
   - Reuse TechMedix card + alert components — do NOT rebuild UI.
2. Grid run action (`api/grid/run` exists) -> triggers a simulated "optimize" pass
   (shed load, shift to solar, schedule robot charging). Returns a plan; UI shows it.
3. Cross-links: Grid dashboard <-> HABITAT designer <-> Store.
   "Your home's robots need this part" -> deep link to /store SKU.
4. Waitlist capture (Grid page already has a form) -> /api/contact or Supabase.

## Scope — Phase 2 (post-MVP)
- Real telemetry ingestion (Supabase) for solar/battery/network via edge agents.
- Grid <-> TechMedix shared failure-signature model (one alerting engine).
- Operator pricing tier (Grid page says "operator pricing").

## Data model (proposed, minimal)
GridSite { id, owner_id, solar_kw, battery_kwh, grid_interconnect, network_nodes, robot_ids[] }
GridState { site_id, solar_now_kw, battery_pct, grid_import_kw, net_export_kw,
            network_health, fleet_count, generated_at }
Reuse PlatformProfile / failureSignatures shapes from lib/platforms so Grid alerts
look identical to TechMedix alerts.

## Open questions for Megan
- [ANSWERED 2026-08-04] Grid = BOTH B2B (operators/builders) and B2C (homeowners).
  Phase 1 builds one data model + role switch (operator view vs homeowner view).
- Any real telemetry source yet, or is Phase 1 a simulator demo?

## Non-goals (do NOT build yet)
- Physical energy hardware. Grid is intelligence + orchestration, not a power plant.
- Competing with utility-scale data-center OS (different market).
