# TechMedix connector + glasses — deploy runbook (2026-10-07)

Everything technical is built and verified. This is the ordered human-side
checklist. Pre-flight (migrations vs. code vs. schema) passed 2026-10-07 —
all three migrations are consistent and safe to run.

## 1. Run the Supabase migrations (in order)

Supabase dashboard → SQL editor, run each file in order:

1. `supabase/migrations/20261007000000_api_keys.sql` — `api_keys` table
2. `supabase/migrations/20261007000001_idempotency_keys.sql` — `idempotency_keys` table
3. `supabase/migrations/20261007000002_demo_fleet.sql` — demo customer `demo`
   (3 robots, 3 alerts; all `ON CONFLICT DO NOTHING`, safe to re-run)

## 2. Mint the reviewer API key

Needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in env:

```bash
node scripts/mint-api-key.mjs --customer demo --name "muse-review"
```

The full key prints **once** — save it immediately. Only the SHA-256 hash is
stored; it cannot be recovered later.

## 3. Commit (suggested grouping — ready to paste)

```bash
# 1. Connector security + alerts endpoint
git add lib/techmedix/api-auth.ts lib/techmedix/rate-limit.ts \
  lib/techmedix/idempotency.ts scripts/mint-api-key.mjs \
  app/api/alerts/route.ts app/api/fleet/route.ts app/api/fleet/\[robotId\]/route.ts \
  app/api/tasks/list/route.ts app/api/tasks/create/route.ts \
  app/api/dispatch/create/route.ts app/api/alerts/\[id\]/route.ts \
  app/api/ar-guidance/route.ts app/api/parts-advisor/route.ts \
  app/api/diagnostics/analyze/route.ts app/api/techmedix/route.ts \
  app/api/techmedix/platforms/route.ts \
  app/api/techmedix/platforms/\[id\]/failure-modes/route.ts \
  app/api/techmedix/failure-modes/\[id\]/protocol/route.ts \
  supabase/migrations/20261007000000_api_keys.sql \
  supabase/migrations/20261007000001_idempotency_keys.sql
git commit -m "feat(connector): auth, rate limiting, idempotency, GET /api/alerts"

# 2. Demo seed, legal, icon, OpenAPI publish
git add supabase/migrations/20261007000002_demo_fleet.sql \
  public/privacy.html public/terms.html public/index.html \
  public/.well-known/ public/techmedix-connector-icon.png \
  docs/muse-connector-spec.md docs/muse-custom-connector-setup.md
git commit -m "feat(connector): demo seed, legal pages, icon, OpenAPI publish"

# 3. Glasses web app + Toolkit application
git add app/glasses/ docs/meta-glasses-spike.md docs/meta-toolkit-application.md \
  AR_MODE_PLAN.md
git commit -m "feat(glasses): Ray-Ban Display web app + Device Access Toolkit application"
```

## 4. Deploy + smoke test

- Deploy as usual.
- Verify: `https://blackcatrobotics.com/.well-known/techmedix-openapi.yaml` loads.
- Verify: `https://blackcatrobotics.com/glasses` renders the key gate.
- Spot-check one connector route with the demo key:
  `curl -H "Authorization: Bearer <key>" https://blackcatrobotics.com/api/alerts?status=active`

## 5. Submit the Muse connector

muse.ai/platform — full checklist is in `docs/muse-connector-spec.md`.
You will need: the OpenAPI URL (step 4), the connector icon
(`public/techmedix-connector-icon.png`), and the reviewer key (step 2).

## 6. Submit the Toolkit application

Copy/paste package is in `docs/meta-toolkit-application.md`:
Meta Managed Account → Wearables Developer Center → interest form answers →
technical appendix → post-acceptance plan.
