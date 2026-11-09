TMS-UI DASHBOARD AUDIT
======================
Repo: /Users/megan/blackcatrobotics-repo/TechMedix-standalone
Date: 2026-10-30
Auditor: tm-ui

Legend: OK = renders, LIVE = real DB data, FIX = needs change, DEAD = dead code/empty

SUMMARY
-------
12 surfaces audited. Critical bugs in procedural 3D models (dead code). Dead links
in knowledge hub. Most non-Robot fleet surfaces use hardcoded mock data with no
DB connection.

1. KNOWLEDGE HUB — knowledge/page.tsx
   Renders:        OK
   Data:           LIVE (via getPlatformsFromSupabase → supabase-service.ts + getAllPlatforms fallback)
   Issues:         FIX  Dead links in SUPPORTING array (lines 23-56):
                     - /knowledge/blueprint  — ROUTE DOES NOT EXIST (confirmed)
                     - /knowledge/simulations — ROUTE DOES NOT EXIST (confirmed)
                     Only /knowledge/modules, /knowledge/failures, /technicians/certifications exist.
                   FIX  Symptom finder data mapping bug (line 121):
                     component: fs.severity  — severity string ("critical"/"warning")
                     is used as component name instead of fs.component.
   Next:            Create /knowledge/blueprint and /knowledge/simulations pages,
                    OR remove the dead links. Fix symptom finder mapping.

2. PLATFORM DETAIL — knowledge/[slug]/page.tsx → platform-knowledge-client.tsx
   Renders:        CONDITIONAL — OK with Supabase, BROKEN without it
   Data:           LIVE (Supabase) with static fallback
   Issues:         CRITICAL  When Supabase is NOT configured, platform is null:
                     - Specs panel never renders (line 162: Object.keys(specs_json).length > 0
                       is false because specs_json comes from platform?.specs_json which is empty)
                     - Archetype defaults to "humanoid" for ALL platforms (line 66-68:
                       platform ? resolveArchetype({slug: platform.id, name: platform.name})
                       : "humanoid")
                     - The staticPlatform data (with correct specs and failureSignatures)
                       is extracted server-side for failure modes but NOT passed to client
                   FIX  Lines 42-86 of page.tsx use staticPlatform for failure modes but
                      pass platform={null} to the client. Merge staticPlatform into the
                      platform object, or pass staticPlatform as a separate prop.
   Next:            Pass static platform data to client as fallback so specs and correct
                    archetype render even without Supabase.

3. PROCEDURAL MODEL VIEWER — knowledge/[slug]/procedural-model.tsx
   Renders:        YES (mesh appears) but INTERACTIVE FEATURES BROKEN — CRITICAL BUG
   Data:           N/A (procedural geometry from buildArchetype in archetype-meshes.ts)
   Issues:         CRITICAL  ProceduralModelViewer (lines 1061-1064) hardcodes Model to
                     GenericArchetypeModel, making 4 specialized model components DEAD CODE:
                       - HumanoidModel (line 168) — PartGroup with onClick, explode, accent
                       - QuadrupedModel (line 494) — PartGroup with onClick, explode, accent
                       - DroneModel (line 754) — PartGroup with onClick, explode, accent
                       - DefaultModel (line 944) — PartGroup with onClick, explode, accent
                     GenericArchetypeModel (line 1040) only accepts {archetype, rotate}
                     and ignores selectedPartId, exploded, onPartClick, accentColor.
                     The PartGroup component (line 83) has click handlers and explosion
                     offsets, but is never rendered.
                     Affects 30 of 35 platforms (all except 5 with URDF paths:
                     unitree-h1, go2, h2, g1, asimov-1/v1/here-be-dragons).
                   FIX  Line 1061-1062: Replace hardcoded GenericArchetypeModel with
                      archetype-dispatched model selection. e.g.:
                      switch(archetype) { case 'humanoid': return HumanoidModel; ... }
   Next:            Fix ProceduralModelViewer to dispatch to specialized models based on
                    archetype. This restores clickable parts, exploded views, and accent
                    coloring for 30+ non-URDF platforms.

4. URDF ROBOT VIEWER — components/urdf-robot-viewer.tsx + urdf-viewer-inner.tsx
   Renders:        OK (for platforms with URDF)
   Data:           Static URDF/STL files from /public/robots/
   Issues:         Only 5 distinct URDF models exist in URDF_ROBOTS registry:
                     unitree-h1, unitree-h2, unitree-g1, unitree-go2, asimov (shared)
                   30 platforms fall back to ProceduralModelViewer (which is BROKEN — see #3)
                   No error boundary or retry UI in the wrapper.
   Next:            Fix procedural fallback (#3); expand URDF coverage for major platforms.

5. TEARDOWN PAGE — teardown/page.tsx
   Renders:        OK
   Data:           NO — hardcoded URDF path and debug data
   Issues:         Hardcoded URDF path: /robots/unitree-h1/h1.urdf (line ~40)
                   __urdfDebug array (lines 143-151) has hardcoded link names that
                   may not match the actual H1 URDF mesh structure.
                   Debug section polls with synthetic values.
   Next:            Parameterize URDF path via route params; validate debug link
                    names against actual URDF.

6. AR MODE — ar/page.tsx
   Renders:        OK — config panel, select dropdowns, results display, reference table
   Data:           LIVE via /api/ar/robots, /api/ar/platforms, /api/ar/failure-modes
                   POSTs to /api/ar-guidance (external LLM)
   Issues:         ROUTER = typeof window !== "undefined" ? window.location.origin : ""
                   (line 41) — works client-side but fragile pattern.
                   ArOverlay receives imageData={undefined} (line 236) — no image
                   passed to AR guidance.
                   /api/ar/platforms (790 bytes) and /api/ar/robots (1068 bytes)
                   exist and query Supabase.
   Next:            Pass captured camera image to /api/ar-guidance for visual fault
                    detection.

7. DRONES PAGE — drones/page.tsx
   Renders:        OK — loading spinner, empty state, filter bar, drone grid
   Data:           LIVE via /api/drones and /api/drones/fleet-health (client-side fetch)
   Issues:         Client-side fetching via useEffect means initial SSR shows loading
                   skeleton. No server-side data pre-fetch.
                   Empty state has "Register First Drone" button with modal.
   Next:            Move data fetching to server component for initial render.

8. DRONE DETAIL — drones/[id]/page.tsx (23,584 chars)
   Renders:        NOT FULLY AUDITED — file was too large to read in full (truncated)
   Data:           Unknown without full read
   Next:            Full audit of drone detail page needed.

9. FLEET DETAIL — fleet/[robotId]/page.tsx
   Renders:        OK when robot exists; notFound() otherwise
   Data:           LIVE via getRobotPageData() → Supabase (falls back to mock)
                   Also calls getMedicalTelemetry() for da Vinci/dVRK medical data
   Issues:         Uses TECHMEDIX_USE_MOCK_DATA env var — if true, all data from
                   lib/shared/mock-data.ts (hardcoded robots, alerts, jobs, diagnostics,
                   telemetryHistory).
   Next:            Verify Supabase env vars are set in Vercel production.

10. NODES LIST — nodes/page.tsx
    Renders:        OK structurally
    Data:           MIXED — systemNodes/nodeEvents from mock-data.ts (STATIC),
                    getDashboardData() from data.ts (potentially LIVE)
    Issues:         systemNodes (line 4: `import { systemNodes, nodeEvents } from
                    "../../../lib/shared/mock-data"`) is ENTIRELY hardcoded — 9 nodes
                    (4 robots, 2 homes, 1 EV, 1 charger, 1 sensor) with fake timestamps
                    and metrics. nodeEvents similarly hardcoded (6 events).
                    Robots in systemNodes are duplicated from mock robots data.
                    Mixed with potentially-live getDashboardData() results creates
                    inconsistency — node list may show different robots than fleet data.
    Next:            Replace systemNodes/nodeEvents imports with live Supabase queries
                     from device_inventory or robots tables.

11. NODE DETAIL — nodes/[platformId]/page.tsx
    Renders:        OK
    Data:           NO — COMPLETELY MOCKED
    Issues:         Generates ALL telemetry via generate30DayTelemetry() (lines 17-42)
                    using Math.random(). Every data point is fabricated:
                    health scores, battery %, motor temps, joint wear, anomalies.
                    Uses getPlatformById() from @/lib/platforms (static catalog only).
                    dynamic = "force-dynamic" (line 12) but serves no purpose since
                    all data is static.
    Next:            Replace generate30DayTelemetry with Supabase query to
                     telemetry_snapshots table.

12. HABITAT PAGE — habitat/page.tsx (25,248 chars)
    Renders:        OK visually
    Data:           NO — ENTIRELY HARDCODED
    Issues:         HABITAT_SYSTEMS is a static const array (line ~70) with fake values:
                    "18.4 kWh" solar, "87%" battery, "4 / 4" nodes online, etc.
                    All timestamps, metrics, and node statuses are hardcoded.
                    GaussianSplatField generates random floating dots via Math.random().
                    3D preview uses CSS transforms — not real 3D rendering.
                    api/habitat-ai route EXISTS but page does NOT fetch from it.
    Next:            Connect HABITAT_SYSTEMS to api/habitat-ai or Supabase; replace
                    GaussianSplatField simulation with real data.

13. FLEET HEALTH CARD — components/fleet-health-card.tsx (git diff: 1 insertion, 4 deletions)
    Renders:        OK
    Data:           LIVE via useSWR → /api/robots/stats (30s refresh)
    Issues:         Recently fixed from hardcoded healthValue=81 to SWR.
                    /api/robots/stats returns {fleet_health_avg: 0, mock: true} when
                    Supabase not configured — triggers CRITICAL state (0% health).
                    fallbackData only provides {fleet_health_avg: initialValue}.
    Next:            None critical — recently improved.

DEPLOYMENT STATUS
-----------------
Git: clean except for fleet-health-card.tsx (recently modified)
     - Removed: const healthValue = 81; // demo
     - Added: useSWR with /api/robots/stats, fallbackData, mock detection
Vercel: https://vercel.com/megan14foster-6817s-projects/techmedix/
DB:    Query via: python3 /Users/megan/Hermes-Bot-mode/techmedix_research.py
       (timed out at 30s — needs longer or network access to Supabase)

CONTENT COVERAGE
----------------
Content files (content/platforms/): 38 markdown files
Static catalog (lib/platforms/index.ts): 35 platforms
URDF models available: 5 (unitree-h1, h2, g1, go2, asimov)
Platforms falling back to broken ProceduralModelViewer: 30
Platforms with working interactive 3D (URDF): 5 (8 slug entries total)
