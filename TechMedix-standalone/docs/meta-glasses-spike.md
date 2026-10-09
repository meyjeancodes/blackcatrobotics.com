# Meta Glasses × TechMedix — Integration Spike

**Date:** 2026-10-07 · **Status:** findings + working prototype
**Prototype:** `app/glasses/` (fleet glance, alerts, AR guidance viewer)

---

## 1. What Meta actually offers (verified Oct 2026)

Two separate developer surfaces — they solve different halves of the problem:

### A. Ray-Ban Display Web Apps — SHIP TODAY, no approval needed
- Web Apps are **plain HTML/CSS/JS hosted on any HTTPS URL** (our Vercel deployment qualifies).
- Run **only on Meta Ray-Ban Display** (monocular HUD, ~20° FOV), not on screenless Ray-Bans.
- Installed by the wearer scanning a **QR code** generated with Meta's tooling, or via `navigator.install()`. Unreviewed apps show an "unverified" label.
- Minimums: glasses software v125+, Meta AI app v272+, Developer Mode enabled.
- Meta provides an AI Coding plugin + Wearables MCP server for scaffolding.
- Design for glanceable, text-first UI — big type, high contrast, minimal chrome.

### B. Wearables Device Access Toolkit — NATIVE, gated
- iOS/Android SDKs giving **your mobile app** access to the glasses' **camera and microphone** (POV capture, open-ear audio).
- Developer preview: you can build and distribute to **testers inside your org** via the Wearables Developer Center (needs a Meta Managed Account). **Public publishing is limited to select partners** during preview; GA was planned for 2026.
- **Meta AI voice is NOT in the preview** — you bring your own assistant/voice pipeline.
- Early partners: Twitch (POV streaming), Disney (park quests), 18Birdies (golf stats), Be My Eyes (accessibility).

### What this means for "AR mode"
| Capability | Screenless Ray-Ban | Ray-Ban Display |
|---|---|---|
| See camera POV in your app | ✅ via Toolkit (gated) | ✅ via Toolkit (gated) |
| Hear/speak via glasses mic+speaker | ✅ via Toolkit (gated) | ✅ via Toolkit (gated) |
| Show visual overlay on lens | ❌ no display | ✅ via Web App (open) |
| Voice-trigger "Hey Meta, ask TechMedix…" | ❌ Meta AI closed to devs | ❌ Meta AI closed to devs |

**Bottom line:** the fastest shippable AR mode is a **Display Web App** (Track A) fed by our existing `/api/ar-guidance`. The deeper hands-free POV pipeline (Track B) needs the Toolkit preview + a native shell, and public distribution needs partner status.

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ TRACK A — Ray-Ban Display Web App (this spike, shippable)    │
│                                                              │
│  Meta Ray-Ban Display ──HTTPS──▶ blackcatrobotics.com/glasses │
│    (monocular HUD, glanceable UI)   │                        │
│                                     ▼                        │
│                        Existing TechMedix API (auth'd)        │
│                        /api/fleet · /api/alerts              │
│                        /api/ar-guidance · /api/techmedix     │
│                                                              │
│  Auth: per-customer connector API key (tmdx_live_…),          │
│  entered once in the web app, stored in localStorage.        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ TRACK B — Native POV bridge (gated, phase 2)                 │
│                                                              │
│  Ray-Ban glasses ──Toolkit SDK──▶ TechMedix native shell     │
│   (camera + mic)        (Capacitor native app                │
│                          — config already in repo)           │
│                                │                             │
│                    ┌───────────┴───────────┐                 │
│                    ▼                       ▼                 │
│         POST /api/ar-guidance      Voice commands            │
│         {image_data}               (bring-your-own           │
│                                   STT/dialog)               │
└──────────────────────────────────────────────────────────────┘
```

The web app and the native bridge converge on the same backend: `/api/ar-guidance`
already accepts `{ robot_id, platform_id, active_fault, image_data? }` and returns
overlay instructions + confidence. Track B just adds a new image source (glasses POV).

---

## 3. Prototype: `app/glasses/`

Display-optimized web app (large type, black/amber, single column, big targets):

| Route | Purpose |
|---|---|
| `/glasses` | API-key gate → fleet at-a-glance (online / warning / active alerts) |
| `/glasses/alerts` | Active alert list → tap for detail |
| `/glasses/guide` | AR guidance viewer: pick robot + describe fault → step-by-step instructions, one step per screen, prev/next |
| `/glasses/install` | Ray-Ban Display install helper: requirements, QR generation steps, troubleshooting |

To try it on hardware later: deploy, open `https://blackcatrobotics.com/glasses`
on the Display via Meta's QR/install flow, enter a connector API key.

---

## 4. Phased plan

**Phase 1 — Web App MVP (done, this spike).** Prototype live in repo. Next: polish
copy, add QR install helper page, test on real Display hardware when available.

**Phase 2 — Toolkit application.** Create Meta Managed Account → org in Wearables
Developer Center → request Device Access Toolkit preview → build POV capture in
the Capacitor native shell → frames → `/api/ar-guidance`.

**Phase 3 — Partner publishing.** Apply for select-partner publishing for public
distribution; until then, org-only beta via the Developer Center.

**Phase 4 — Voice.** Bring-your-own voice pipeline (Meta AI voice remains closed
to third parties). Evaluate on-device STT vs. cloud.

## 5. Risks & open questions

1. **Display hardware access** — we have no Ray-Ban Display unit to test the web app; the UI is built to documented constraints (20° FOV, glanceable) but unverified on-device.
2. **Toolkit approval timeline** — preview access and especially public-publishing partner status are at Meta's discretion; no published SLA.
3. **No Meta AI hook** — "ask TechMedix" via Meta's own voice assistant is not available to third parties; our voice story must be bring-your-own.
4. **Screenless Ray-Bans can't show overlays** — for the majority of Ray-Ban owners, "AR mode" = phone screen + glasses camera/mic, not on-lens visuals. Set expectations accordingly.
5. **In-memory rate limiter** is per-instance; fine for the spike, move to Redis/Upstash before public launch.

## 6. References

- Meta Wearables Device Access Toolkit announcement (Dec 2025, developers.meta.com)
- Ray-Ban Display Web Apps setup docs (wearables.developer.meta.com, updated Sep 2026)
- Engadget: "Meta is bringing third-party apps and games to its display glasses" (May 2026)
