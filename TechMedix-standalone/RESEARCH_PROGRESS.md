# Research Progress

_Last updated: 2026-04-04T00:00:00.000Z — initialized, no runs completed yet_

| Platform | Failure Modes | Protocols | Signals | Avg Confidence | Low-Conf | Status | Last Updated |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Unitree G1 | — | — | — | — | — | pending | — |
| Unitree H1-2 | — | — | — | — | — | pending | — |
| Boston Dynamics Spot | — | — | — | — | — | pending | — |
| DJI Agras T50 | — | — | — | — | — | pending | — |
| DJI Matrice 350 RTK | — | — | — | — | — | pending | — |
| Amazon Proteus AMR | — | — | — | — | — | pending | — |
| Zipline P2 Zip | — | — | — | — | — | pending | — |
| Serve Robotics RS2 | — | — | — | — | — | pending | — |
| Starship Gen 3 | — | — | — | — | — | pending | — |
| Figure 02 | — | — | — | — | — | pending | — |
| Skydio X10 | — | — | — | — | — | pending | — |
| Lime Gen 4 E-scooter | — | — | — | — | — | pending | — |
| Bird Three E-scooter | — | — | — | — | — | pending | — |
| Rad Power Commercial eBike | — | — | — | — | — | pending | — |

## Notes
- `FM` = failure modes inserted this run (upsert — may not reflect cumulative total)
- Low-Conf = entries with < 3 independent sources
- Confidence is 0–1 averaged across all failure modes found in this run
- Run the agent: `npx ts-node scripts/run-research-agent.ts`
- Single platform: `npx ts-node scripts/run-research-agent.ts --platform unitree_g1`
- Dry run: `npx ts-node scripts/run-research-agent.ts --dry-run`

## How to trigger via API
```
POST /api/knowledge/research
Content-Type: application/json

{ "platform": "unitree_g1" }
```

## Cron schedule
The `supabase/functions/research-cron/index.ts` Edge Function runs every Sunday at 03:00 UTC.
Deploy with: `supabase functions deploy research-cron`
