# TechMedix × Muse Connector — Specification

**Status:** Draft v0.1 (2026-10-07)
**Owner:** BlackCat Robotics
**Goal:** Publish TechMedix as a connector in the Muse Connector Directory (submit at `muse.ai/platform`), so fleet operators can manage robots, diagnose faults, order parts, and dispatch repairs by talking to Muse.

---

## 1. Product summary (for the submission form — Overview step)

> **TechMedix** is AI maintenance intelligence for robot fleets. It watches every robot, detects failures before they happen, explains the risk, recommends the repair, and matches the right parts and technicians. Through this connector, Muse users can check fleet health, investigate alerts, look up failure modes and repair protocols, get AR repair guidance, find parts, and create dispatch work orders — all in natural language.

- **Category:** Fleet operations / predictive maintenance
- **Website:** https://blackcatrobotics.com
- **Open source core:** AGPL-3.0 (TechMedix Core). Connector talks to the hosted/managed API.

---

## 2. Example prompts (for the submission form — include 10–15)

| # | Prompt | Connector tool(s) used |
|---|--------|------------------------|
| 1 | "How's my fleet doing right now?" | `fleet_status` |
| 2 | "What's wrong with robot H1-07?" | `robot_detail` |
| 3 | "Show me active alerts across the fleet." | `alerts_list` *(to build)* |
| 4 | "What are the known failure modes for the Unitree H1?" | `platform_failure_modes` |
| 5 | "Give me the repair protocol for knee actuator drift on the H1." | `failure_mode_protocol` |
| 6 | "Run a diagnostic analysis on platform unitree-h1 with this telemetry: …" | `diagnose` |
| 7 | "I need AR repair guidance for H1-07's left knee actuator." | `ar_guidance` |
| 8 | "Find me a replacement knee actuator for the H1, in stock in the US." | `parts_advisor` |
| 9 | "Create a work order for H1-07's actuator fault, high priority." | `dispatch_create` ⚠️ confirm |
| 10 | "Mark alert abc123 as resolved." | `alert_resolve` ⚠️ confirm |
| 11 | "Add a task: inspect DJI fleet batteries before spray season." | `task_create` ⚠️ confirm |
| 12 | "What parts do I need for a Spot arm joint replacement?" | `parts_advisor` |
| 13 | "Which robots have open work orders?" | `fleet_status` |
| 14 | "Explain what happens if I keep running H1-07 with this fault." | `diagnose` + `failure_mode_protocol` |
| 15 | "Draft my weekly maintenance summary." | `fleet_status` + `alerts_list` *(to build)* |

---

## 3. Tool catalog

### 3a. Read tools (safe — no confirmation needed)

| Tool | Method + path | Purpose | Key inputs |
|------|---------------|---------|------------|
| `fleet_status` | `GET /api/fleet?customerId=` | List robots with latest alert + open job | `customerId` (required) |
| `robot_detail` | `GET /api/fleet/{robotId}` | Single robot detail | `robotId` |
| `platform_catalog` | `GET /api/techmedix?slim=1&type=&manufacturer=` | Platform list w/ failure modes + protocols | `slim`, `type`, `manufacturer` (optional filters) |
| `platform_failure_modes` | `GET /api/techmedix/platforms/{id}/failure-modes` | Failure modes for one platform | `id` |
| `failure_mode_protocol` | `GET /api/techmedix/failure-modes/{id}/protocol` | Repair protocol for a failure mode | `id` |
| `alerts_list` | `GET /api/alerts?customerId=` | **TO BUILD** — list alerts w/ filters | `customerId`, `status` |
| `diagnose` | `POST /api/diagnostics/analyze` | Run diagnostic pipeline on telemetry frame | `platformId` (required), `frame`, `history` |
| `ar_guidance` | `POST /api/ar-guidance` | AR overlay repair instructions (+ optional image) | `robot_id`, `platform_id`, `active_fault`, `image_data?` |
| `parts_advisor` | `POST /api/parts-advisor` | Natural-language parts search | `query` |
| `tasks_list` | `GET /api/tasks/list` | List maintenance tasks | — |

### 3b. Write tools (require user confirmation — `x-requires-confirmation: true`)

| Tool | Method + path | Purpose | Key inputs | Why it confirms |
|------|---------------|---------|------------|-----------------|
| `alert_resolve` | `PATCH /api/alerts/{id}` | Mark an alert resolved | `id` | Mutates alert state |
| `dispatch_create` | `POST /api/dispatch/create` | Create a repair work order | `robotId`, `failureMode`, `description?`, `priority?` | Creates operational work |
| `task_create` | `POST /api/tasks/create` | Create a maintenance task | (see route) | Creates records |

**Idempotency:** `dispatch_create` and `task_create` must accept and honor an `Idempotency-Key` header before submission. Retries must not create duplicate work orders.

**Deliberate exclusions (state in tool descriptions):** the connector cannot process payments (Stripe checkout stays on the website), cannot ingest raw telemetry (devices use the separate `TELEMETRY_API_KEY` firehose), and cannot modify robot firmware or control robots.

---

## 4. OpenAPI 3.1 — connector surface

Base URL: `https://blackcatrobotics.com/api`
Auth: `Bearer <TECHMEDIX_API_KEY>` (per-customer key, see §5).

```yaml
openapi: 3.1.0
info:
  title: TechMedix Fleet Intelligence
  version: 1.0.0
  description: >-
    AI maintenance intelligence for robot fleets. Read-only tools report fleet
    health, failure modes, repair protocols, diagnostics, AR guidance, and parts.
    Write tools (dispatch_create, alert_resolve, task_create) mutate operational
    state and require user confirmation. This connector cannot process payments,
    ingest device telemetry, or control robots.
servers:
  - url: https://blackcatrobotics.com/api
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: Per-customer TechMedix API key issued in the dashboard.
paths:
  /fleet:
    get:
      operationId: fleet_status
      summary: List robots with latest alert and open work order
      description: Read-only. Returns each robot with its latest active alert and open job, if any.
      parameters:
        - { name: customerId, in: query, required: true, schema: { type: string } }
      responses:
        '200': { description: Fleet list }
  /fleet/{robotId}:
    get:
      operationId: robot_detail
      summary: Get a single robot's detail
      description: Read-only.
      parameters:
        - { name: robotId, in: path, required: true, schema: { type: string } }
      responses:
        '200': { description: Robot detail }
  /techmedix:
    get:
      operationId: platform_catalog
      summary: Platform catalog with failure modes and protocols
      description: Read-only. Use slim=1 for a lightweight platform list.
      parameters:
        - { name: slim, in: query, schema: { type: string, enum: ['1'] } }
        - { name: type, in: query, schema: { type: string } }
        - { name: manufacturer, in: query, schema: { type: string } }
      responses:
        '200': { description: Platform catalog }
  /techmedix/platforms/{id}/failure-modes:
    get:
      operationId: platform_failure_modes
      summary: Failure modes for a platform
      description: Read-only.
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        '200': { description: Failure modes }
  /techmedix/failure-modes/{id}/protocol:
    get:
      operationId: failure_mode_protocol
      summary: Repair protocol for a failure mode
      description: Read-only. Returns step-by-step repair protocol.
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        '200': { description: Repair protocol }
  /alerts:
    get:
      operationId: alerts_list
      summary: List fleet alerts
      description: Read-only. PROPOSED — endpoint does not exist yet (see §8).
      parameters:
        - { name: customerId, in: query, required: true, schema: { type: string } }
        - { name: status, in: query, schema: { type: string, enum: [active, resolved, all] } }
      responses:
        '200': { description: Alert list }
  /alerts/{id}:
    patch:
      operationId: alert_resolve
      summary: Mark an alert resolved
      description: Mutates alert state. Requires user confirmation.
      x-requires-confirmation: true
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        '200': { description: Resolution result }
  /diagnostics/analyze:
    post:
      operationId: diagnose
      summary: Run diagnostic analysis on a telemetry frame
      description: Read-only analysis. Rate-limited (1 req / platform / interval).
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [platformId]
              properties:
                platformId: { type: string }
                frame: { type: object, description: Telemetry frame }
                history: { type: array, items: { type: object } }
      responses:
        '200': { description: Diagnostic report }
  /ar-guidance:
    post:
      operationId: ar_guidance
      summary: Get AR repair guidance for a robot fault
      description: Read-only. Returns step-by-step overlay instructions, tools, safety warnings, confidence.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [robot_id, platform_id, active_fault]
              properties:
                robot_id: { type: string }
                platform_id: { type: string }
                active_fault: { type: string }
                image_data: { type: string, description: Base64 image, optional }
      responses:
        '200': { description: Overlay instructions + confidence }
  /parts-advisor:
    post:
      operationId: parts_advisor
      summary: Natural-language parts search
      description: Read-only. Searches parts inventory + supplier catalog. Cannot place orders.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [query]
              properties:
                query: { type: string }
      responses:
        '200': { description: Matching parts and suppliers }
  /dispatch/create:
    post:
      operationId: dispatch_create
      summary: Create a repair work order
      description: Creates an operational work order. Requires user confirmation. Idempotent via Idempotency-Key header.
      x-requires-confirmation: true
      parameters:
        - { name: Idempotency-Key, in: header, schema: { type: string } }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [robotId, failureMode]
              properties:
                robotId: { type: string }
                failureMode: { type: string }
                description: { type: string }
                priority: { type: string }
      responses:
        '200': { description: Created work order }
```

---

## 5. Auth design

**Recommended: per-customer Bearer API keys** (`Authorization: Bearer <key>`).

- Follows the existing, proven pattern in `POST /api/telemetry/ingest` (`TELEMETRY_API_KEY`).
- Server-to-server friendly: Muse's agent calls the API directly; browser session cookies (`/api/diagnostics/analyze` pattern) don't work for an external agent.
- Keys issued per customer in the TechMedix dashboard, scoped to that customer's fleet (`customerId` binding server-side — never trust a client-supplied `customerId` once keys exist).
- Reviewer test account: create a dedicated demo customer (`customerId=demo`) with representative fleet data for Meta's end-to-end review.

**Do not ship the connector on the current auth posture.** Today only 4 of 58 routes check any credential. The connector surface (§3) must sit behind the API-key middleware before submission.

---

## 6. Submission checklist (muse.ai/platform → Submit a connector)

- [ ] Connector name, product website, description (§1)
- [ ] 10–15 example prompts (§2)
- [ ] Hosted API endpoint + this OpenAPI spec (§4)
- [ ] 512×512 PNG/SVG connector icon
- [ ] Privacy policy URL + Terms of Service URL
- [ ] Support contact + work email for the developer account
- [ ] Auth documentation + dedicated reviewer test account (demo fleet)
- [ ] Data-processing details: what personal/fleet data the connector touches, subprocessors (Supabase, Vercel, Moonshot/Kimi), retention, deletion, international transfers
- [ ] Legal business details (BlackCat Robotics)

Meta reviews for functional, security, and legal requirements and runs end-to-end tests before directory listing. No review SLA, fees, or revenue share have been published.

---

## 7. Fast path — Custom Connector (no Meta review)

Any Muse user can point Muse at a public OpenAPI spec today and have the agent build a **Custom Connector** — Meta does not review these. To unlock this immediately:

1. Publish `openapi.yaml` (from §4) at `https://blackcatrobotics.com/.well-known/techmedix-openapi.yaml`.
2. Publish a short setup prompt ("Connect TechMedix: use this spec, ask me for my API key, store it securely…").
3. Announce it on the site's integrations page.

This gets real users weeks/months before directory review completes.

---

## 8. Gaps to close before submission

| # | Gap | Effort | Status |
|---|-----|--------|--------|
| 1 | **Auth middleware** on the 13 connector routes (Bearer API key, customer scoping) | ~1 day | ✅ Done 2026-10-07 — `lib/techmedix/api-auth.ts`, `api_keys` table, `scripts/mint-api-key.mjs` |
| 2 | **Build `GET /api/alerts`** (list w/ `customerId` + `status` filter) — prompts 3 & 15 depend on it | ~2 hrs | ✅ Done 2026-10-07 — `app/api/alerts/route.ts` |
| 3 | **Idempotency-Key** support on `dispatch/create` and `tasks/create` | ~2 hrs | ✅ Done 2026-10-07 — `lib/techmedix/idempotency.ts`, `idempotency_keys` table |
| 4 | **Rate limiting** on connector routes (reuse the `diagnostics/analyze` pattern) | ~3 hrs | ✅ Done 2026-10-07 — `lib/techmedix/rate-limit.ts`, 100 req/min per customer per route, wired into all 14 routes |
| 5 | **Reviewer demo account** — seeded demo fleet + docs | ~2 hrs | ✅ Done 2026-10-07 — `20261007000002_demo_fleet.sql` (customer `demo`, 3 robots, 3 alerts); mint key via `scripts/mint-api-key.mjs --customer demo` |
| 6 | **Privacy policy + ToS pages** on blackcatrobotics.com | ~half day | ✅ Done 2026-10-07 — updated `public/privacy.html` (connector/subprocessor/API-key sections), new `public/terms.html`, footer links added |
| 7 | **512×512 connector icon** | ~1 hr | ✅ Done 2026-10-07 — `public/techmedix-connector-icon.png` |
| 8 | Publish OpenAPI at `/.well-known/` + setup prompt for the Custom Connector fast path | ~1 hr | ✅ Done 2026-10-07 — `public/.well-known/techmedix-openapi.yaml`, `docs/muse-custom-connector-setup.md` |

---

## 9. Suggested build order

1. ~~Auth middleware + rate limits (§8.1, §8.4) — blocks everything.~~ ✅ Done 2026-10-07.
2. ~~`GET /api/alerts` + idempotency (§8.2, §8.3).~~ ✅ Done 2026-10-07.
3. ~~Demo account + seeded data (§8.5).~~ ✅ Done 2026-10-07 — run the migration, then mint the reviewer key.
4. ~~Publish OpenAPI + setup prompt → **Custom Connector live** (§7).~~ ✅ Done 2026-10-07 — deploy and announce.
5. ~~Privacy/ToS + icon (§8.6, §8.7).~~ ✅ Done 2026-10-07.
6. **Submit to muse.ai/platform** (§6) — needs only your Meta developer account, work email, and legal business details.
