# Handoff: Hermes — finish the TechMedix connector + glasses launch

**From:** Muse · **Date:** 2026-10-07
**For:** Hermes (AI agent with access to Supabase, Vercel, GitHub, and project secrets)

The owner doesn't code — you own the technical execution end to end. Everything
below is built, reviewed, and verified (`tsc --noEmit` and eslint clean as of
2026-10-07). Your job is the human-side checklist: migrations, key minting,
commit, deploy, smoke tests. The two directory submissions at the end need the
owner's Meta accounts — prepare everything, then hand those two to the owner.

Repo: `https://github.com/meyjeancodes/blackcatrobotics.com` (app lives in
`TechMedix-standalone/`; all paths below are relative to that directory unless
noted).

---

## 0. What was built (context)

- **Muse connector backend:** per-customer Bearer API keys (`lib/techmedix/api-auth.ts`,
  `api_keys` table), sliding-window rate limiting (`lib/techmedix/rate-limit.ts`,
  100 req/min/customer/route), idempotent work-order/task creation
  (`lib/techmedix/idempotency.ts`, `idempotency_keys` table), new
  `GET /api/alerts` endpoint, auth wired into all 14 connector routes, two
  fleet-route alert-query bugs fixed (`status` → `resolved`).
- **Demo data:** migration seeds customer `demo` (3 robots, 3 alerts).
- **Legal:** updated `public/privacy.html`, new `public/terms.html`, footer links.
- **Assets:** `public/techmedix-connector-icon.png` (512×512), OpenAPI at
  `public/.well-known/techmedix-openapi.yaml`, setup prompt in
  `docs/muse-custom-connector-setup.md`.
- **Glasses:** Ray-Ban Display web app at `app/glasses/` (fleet glance, alerts,
  step-by-step repair guidance, install helper); Toolkit application package in
  `docs/meta-toolkit-application.md`.
- Full spec: `docs/muse-connector-spec.md`. Human runbook: `docs/deploy-runbook.md`.

## 1. Access you need (verify before starting)

- Supabase project access (dashboard SQL editor, or CLI linked to the project)
- `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` in your env
- GitHub push access to the repo
- Vercel project `techmedix` (push to main auto-deploys — confirm this is still wired)

## 2. Run the migrations (in order, Supabase SQL editor)

1. `supabase/migrations/20261007000000_api_keys.sql`
2. `supabase/migrations/20261007000001_idempotency_keys.sql`
3. `supabase/migrations/20261007000002_demo_fleet.sql` (idempotent — safe to re-run)

Verify: `select count(*) from api_keys;` etc. should succeed with no errors.

## 3. Mint the reviewer API key

```bash
node scripts/mint-api-key.mjs --customer demo --name "muse-review"
```

The key prints **once**. Save it to the team's secret store (and Vercel env if
needed for smoke tests). **Never commit it, never paste it into the repo.**

## 4. Commit and push (three commits, ready to paste)

```bash
# 1. Connector security + alerts endpoint
git add lib/techmedix/api-auth.ts lib/techmedix/rate-limit.ts \
  lib/techmedix/idempotency.ts scripts/mint-api-key.mjs \
  app/api/alerts/route.ts app/api/fleet/route.ts "app/api/fleet/[robotId]/route.ts" \
  app/api/tasks/list/route.ts app/api/tasks/create/route.ts \
  app/api/dispatch/create/route.ts "app/api/alerts/[id]/route.ts" \
  app/api/ar-guidance/route.ts app/api/parts-advisor/route.ts \
  app/api/diagnostics/analyze/route.ts app/api/techmedix/route.ts \
  app/api/techmedix/platforms/route.ts \
  "app/api/techmedix/platforms/[id]/failure-modes/route.ts" \
  "app/api/techmedix/failure-modes/[id]/protocol/route.ts" \
  supabase/migrations/20261007000000_api_keys.sql \
  supabase/migrations/20261007000001_idempotency_keys.sql
git commit -m "feat(connector): auth, rate limiting, idempotency, GET /api/alerts"

# 2. Demo seed, legal, icon, OpenAPI publish
git add supabase/migrations/20261007000002_demo_fleet.sql \
  public/privacy.html public/terms.html public/index.html \
  public/.well-known/ public/techmedix-connector-icon.png \
  docs/muse-connector-spec.md docs/muse-custom-connector-setup.md \
  docs/deploy-runbook.md
git commit -m "feat(connector): demo seed, legal pages, icon, OpenAPI publish"

# 3. Glasses web app + Toolkit application
git add app/glasses/ docs/meta-glasses-spike.md docs/meta-toolkit-application.md \
  AR_MODE_PLAN.md
git commit -m "feat(glasses): Ray-Ban Display web app + Device Access Toolkit application"

git push origin main
```

## 5. Deploy + smoke test

1. Confirm the Vercel `techmedix` deployment succeeds on push.
2. `https://blackcatrobotics.com/.well-known/techmedix-openapi.yaml` → loads, valid YAML.
3. `https://blackcatrobotics.com/glasses` → renders the API-key gate.
4. Authed API check:
   `curl -H "Authorization: Bearer <demo-key>" "https://blackcatrobotics.com/api/alerts?status=active"`
   → expect the 2 active demo alerts.
5. Unauthed check: same URL without the header → expect `401`.

If any check fails, fix forward and report — do not leave the deploy red.

## 6. STOP — hand these two to the owner (needs their Meta accounts)

Do **not** attempt these yourself; they require the owner's identity and legal
attestations. Prepare everything, then report ready:

- **Muse connector submission** at muse.ai/platform — checklist in
  `docs/muse-connector-spec.md` §6. Needs: OpenAPI URL (§5.2 above), icon file,
  reviewer key (§3 above), plus owner's work email + legal business details.
- **Device Access Toolkit application** — copy/paste package in
  `docs/meta-toolkit-application.md`. Needs: owner's Meta Managed Account +
  Wearables Developer Center org, then the interest form.

## 7. Report back

When done, report: migrations applied (yes/no), key minted (yes — stored where,
**never the key itself**), commit SHAs, deploy URL + smoke test results
(pass/fail per check), and confirmation that the two submissions are queued for
the owner. Flag anything you could not complete and what you need.
