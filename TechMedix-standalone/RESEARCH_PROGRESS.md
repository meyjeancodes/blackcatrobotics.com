# Research Progress

_Last updated: 2026-04-16 — Full audit and data sync completed_

| Platform | Failure Modes | Protocols | Signals | Avg Confidence | Status | Last Updated |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Unitree G1 | 8 | 8 | 18 | low (unverified) | ✅ seeded | 2026-04-16 |
| Unitree H1-2 | 8 | 8 | 18 | low (unverified) | ✅ seeded | 2026-04-16 |
| Unitree B2 | 6 | 6 | 14 | low (unverified) | ✅ seeded | 2026-04-16 |
| Unitree R1 AIR | — | — | — | — | pending (no data yet) | — |
| Boston Dynamics Spot | 5 | 5 | 13 | low (unverified) | ✅ live in DB | 2026-04-16 |
| Figure 02 | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| Tesla Optimus Gen2 | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| DJI Agras T50 | 8 | 8 | 16 | low (unverified) | ✅ seeded | 2026-04-16 |
| DJI Agras T60 | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| DJI Matrice 350 RTK | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| Skydio X10 | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| Zipline P2 Zip | 7 | 7 | 14 | low (unverified) | ✅ seeded | 2026-04-16 |
| Serve Robotics RS2 | 7 | 7 | 16 | low (unverified) | ✅ seeded | 2026-04-16 |
| Starship Gen 3 | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| Amazon Proteus AMR | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| Lime Gen 4 E-scooter | 6 | 6 | 12 | low (unverified) | ✅ seeded | 2026-04-16 |
| RadCommercial Cargo | 5 | 5 | 10 | low (unverified) | ✅ seeded | 2026-04-16 |
| Asimov Here Be Dragons | — | — | — | — | skipped (insufficient public data) | — |

## Notes
- All confidence values are `low` — source_urls are `["unverified-training-data"]`
- Weekly live research cron (Serper + Claude) replaces unverified data with cited sources
- Cron schedule: **daily at 03:00 UTC** (`0 3 * * *`) as of 2026-04-16 (was weekly Monday)
- Boston Dynamics Spot data applied directly to DB; all others via migration files
- `FM` = failure modes, `Protocols` = repair protocols, `Signals` = predictive signals

## How to apply pending seed migrations to Supabase
```bash
# Apply all 20260416 research migrations
supabase db push --project-ref ctmzckhdwoobzrwoocvb

# Or apply individually via Supabase SQL editor:
# supabase/migrations/20260416_research_humanoids.sql  (Unitree G1, H1-2, B2)
# supabase/migrations/20260416_research_drones_1.sql   (DJI T50, T60, Matrice 350)
# supabase/migrations/20260416_research_drones_2.sql   (Skydio X10, Zipline P2)
# supabase/migrations/20260416_research_delivery_1.sql (Figure 02, Tesla Optimus, Serve RS2)
# supabase/migrations/20260416_research_delivery_2.sql (Starship, Proteus, Lime, Rad)
```

## How to trigger a live research run
```
POST /api/techmedix/research/run
x-blackcat-secret: <BLACKCAT_API_SECRET>
Content-Type: application/json

{}
```

Or single platform:
```
POST /api/techmedix/research/run
{ "platform": "unitree-g1" }
```

## Cron schedule
- Research run: `0 3 * * *` (daily 03:00 UTC) — Vercel cron → `/api/techmedix/research/run`
- Simulation: `0 0 * * *` (daily midnight UTC) — Vercel cron → `/api/simulation/run`
- Monitor: Supabase Edge Function `monitor` — deploy and schedule at 5-minute intervals

## VLA Integration (Unitree G1)
Unitree G1 platform specs updated from BCR-VLA-ANALYSIS.md (2026-04-16):
- Total DOF: 43 (29-DOF body + 7+7 arms)
- VLA telemetry: EE_R6_G1 mode (23-dim), JOINT_G1 mode (16-dim)
- F/T sensors: 13 (6 wrist, 6 ankle, 1 waist)
- Action chunk: 25 steps @ 20Hz = 1.25s anomaly detection window
- Model: UnifoLM-VLA-0 (Qwen2.5-VL backbone)
- HuggingFace datasets: 12 task categories (G1_Stack_Block, G1_Bag_Insert, etc.)

## Platform slug reference (DB)
| Slug | Platform |
|---|---|
| unitree-g1 | Unitree G1 |
| unitree-h1-2 | Unitree H1-2 |
| unitree-b2 | Unitree B2 |
| unitree-r1 | Unitree R1 AIR |
| boston-dynamics-spot | Boston Dynamics Spot |
| figure-02 | Figure 02 |
| tesla-optimus | Tesla Optimus Gen2 |
| dji-agras-t50 | DJI Agras T50 |
| dji-agras-t60 | DJI Agras T60 |
| dji-matrice-350 | DJI Matrice 350 RTK |
| skydio-x10 | Skydio X10 |
| zipline-p2 | Zipline P2 Zip |
| serve-rs2 | Serve Robotics RS2 |
| starship-gen3 | Starship Gen 3 |
| amazon-proteus | Amazon Proteus AMR |
| lime-gen4 | Lime Gen 4 E-scooter |
| radcommercial | RadCommercial Cargo |
| asimov-here-be-dragons | Asimov Here Be Dragons (roadmap) |
