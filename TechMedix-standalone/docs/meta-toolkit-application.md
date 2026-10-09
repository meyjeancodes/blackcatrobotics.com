# Meta Wearables Device Access Toolkit — Application Package

**Prepared:** 2026-10-07 · **For:** BlackCat Robotics (TechMedix)
**Goal:** Get Device Access Toolkit preview access (camera + mic for Ray-Ban AI glasses)
and position for select-partner publishing.

Meta's process (per developers.meta.com): create a **Meta Managed Account** →
set up your **organization in the Wearables Developer Center** → submit the
**Device Access Toolkit interest form** → build in preview → distribute to org
testers via the beta platform → apply for partner publishing.

---

## Part 1 — Account & org setup checklist

- [ ] Create a Meta Managed Account at the Wearables Developer Center
      (use a shared company identity, e.g. dev@blackcatrobotics.com — not a personal account)
- [ ] Create the **BlackCat Robotics** organization; add team members
- [ ] Create a project named **TechMedix Glasses**
- [ ] Join the Developer Community (iOS / Android) for SDK updates
- [ ] Install the AI Coding plugin + Wearables MCP server
      (`https://mcp.developer.meta.com/wearables`) for scaffolding help

## Part 2 — Interest form answers (copy/paste, adjust as needed)

**Company:** BlackCat Robotics — Houston, Texas. We build TechMedix, AI
maintenance intelligence for robot fleets (predictive diagnostics, repair
guidance, parts + technician dispatch). Open-source core (AGPL-3.0), commercial
hosted platform at blackcatrobotics.com.

**What we want to build:** A hands-free technician workflow. A field technician
wearing Ray-Ban AI glasses looks at a robot; our mobile app captures the POV
camera frame via the Toolkit, sends it to TechMedix's AR guidance API, and
returns step-by-step repair instructions (parts highlighted, tools listed,
safety warnings) — viewable on the Ray-Ban Display via our companion Web App,
or read aloud via the glasses' open-ear speakers. Microphone input enables
hands-free commands ("next step", "what part is this?").

**Why glasses (and not just a phone):** Technicians' hands are on the robot.
POV capture shows exactly what the technician sees — no aiming a phone camera
while holding a torque wrench. This is the core unlock for field maintenance.

**Target users:** Fleet operators running Unitree humanoids, DJI agricultural
drones, Boston Dynamics Spot, and similar platforms — initially our existing
TechMedix customer base, expanding to enterprise maintenance teams.

**Data handling:**
- Camera frames are transmitted to TechMedix servers solely to generate repair
  guidance for the active work order; frames are not used for advertising and
  are not sold.
- Audio is processed for command recognition; we do not retain raw audio
  beyond the session unless the customer opts into quality logging.
- All data encrypted in transit (TLS) and at rest; per-customer API keys,
  revocable at any time. See https://blackcatrobotics.com/privacy.html.

**Development timeline:**
- Month 1–2: Toolkit SDK integrated into our Capacitor native shell; POV frame
  → `/api/ar-guidance` pipeline working in org beta.
- Month 3: Technician pilot with 2–3 fleet customers; iterate on guidance quality.
- Month 4+: Apply for partner publishing for public distribution.

**What we need from Meta:** Device Access Toolkit preview SDK access (iOS +
Android), beta distribution for org testers, and guidance on the partner
publishing review criteria.

## Part 3 — Technical appendix (attach if asked)

```
Ray-Ban glasses ──Toolkit SDK──▶ TechMedix native shell (Capacitor)
 (camera + mic)      iOS/Android              │
                                              ▼
                                   POST /api/ar-guidance
                                   { robot_id, platform_id,
                                     active_fault, image_data }
                                              │
                                              ▼
                                   { overlay_response, confidence }
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                    Ray-Ban Display Web App            Open-ear audio
                    (glanceable steps)                 (spoken steps)
```

- Backend already in production: `/api/ar-guidance` (vision analysis via
  Kimi/Moonshot, Supabase-logged), `/api/fleet`, `/api/alerts`,
  `/api/techmedix` catalog, per-customer Bearer API keys, rate limiting,
  idempotent work-order creation.
- Web App prototype already built (`/glasses` on blackcatrobotics.com) —
  demonstrates the on-lens experience Meta reviewers can try today via QR install.
- Privacy policy and Terms of Service published; DPA available on request.

## Part 4 — After acceptance

1. Pull the iOS/Android SDKs + sample apps; spike POV capture in a branch.
2. Wire frames → `/api/ar-guidance`; render steps in the Web App + audio readout.
3. Distribute to org testers via the Developer Center beta platform.
4. Collect technician feedback; harden (offline queueing, low-bandwidth mode).
5. Submit partner-publishing application with pilot results.
