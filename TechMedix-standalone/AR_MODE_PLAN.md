# TechMedix AR Mode — Meta Ray-Ban Display Integration Plan

## Architecture

Meta Ray-Ban Display glasses capture video frames, run vision analysis, and display overlay responses. TechMedix needs a complete AR pipeline:

```
Meta Ray-Ban Display Glasses
  │  (WebRTC video frames + WebXR overlay commands)
  ▼
┌─────────────────────────────────────────────────┐
│  Next.js 16 App (TechMedix-standalone)          │
│                                                   │
│  app/api/ar-guidance/route.ts  ← NEW            │
│    POST { robot_id, platform_id, fault, image }  │
│    → returns { overlay_response, confidence }     │
│                                                   │
│  components/ar-overlay.tsx         ← NEW          │
│    WebXR + 3D URDF overlay for fault highlighting│
│                                                   │
│  lib/techmedix/skills/ar-guidance/index.ts ← NEW │
│    Skill registry entry                            │
│                                                   │
│  lib/techmedix/memory/index.ts     ← EXTEND       │
│    Add insertArGuidance() + getArGuidance()       │
└─────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│  Supabase (ctmzckhdwoobzrwoocvb) │
│                                   │
│  ar_guidance_log  ← migration    │
│    id, robot_id, platform_id,     │
│    active_fault, overlay_response,│
│    confidence, created_at         │
└─────────────────────────────────┘
```

## Current State
- **No AR route exists.** `app/api/ar-guidance/route.ts` was deleted.
- **No AR source code anywhere.** Only 3D URDF viewer exists (Three.js + R3F).
- **Supabase migration orphaned.** `20260402000000_ar_guidance_log.sql` creates `ar_guidance_log` but 0/10 tables are migrated.
- **Stale Vercel symlinks.** `ar-guidance.func` → `ai/fleet-insight.func` (dead code).
- **Working stack:** Next.js 16 + Supabase JS client + React Three Fiber + Ollama client.
- **Environment:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OLLAMA_MODEL=glm-5.2:cloud`.

## Data Contract (from `ar_guidance_log` schema)
- Input: `{ robot_id, platform_id, active_fault, image_data? }`
- Processing: Vision analysis via Ollama (already in `lib/blackcat/ollama.ts`)
- Output: `{ overlay_response jsonb, confidence float }`
- Storage: `ar_guidance_log` table in Supabase

## Phases

### Phase 1 — Restore Supabase Foundation (~30 min)
1. Re-run `supabase/migrations/20260402000000_ar_guidance_log.sql` against live Supabase via Supabase CLI or dashboard
2. Verify `ar_guidance_log` table exists with correct columns
3. Test insert via `lib/techmedix/memory/index.ts` `getSupabase()` client

### Phase 2 — Rebuild AR Guidance API Route (~2-3 hours)
1. Create `app/api/ar-guidance/route.ts`
2. POST handler: accept `{ robot_id, platform_id, active_fault, image_data? }`
3. Route fault → Ollama vision analysis via `lib/blackcat/ollama.ts`
4. Return `{ overlay_response, confidence }`
5. Write to `ar_guidance_log`

### Phase 3 — Build AR Overlay Component (~3-4 hours)
1. Create `components/ar-overlay.tsx` using WebXR
2. Reuse existing `UrdfRobotViewer` for 3D part highlighting
3. Fallback: mobile AR camera feed + 3D overlay via `<iframe>` embed pattern

### Phase 4 — Skill Registration & Glasses Protocol (~2 hours)
1. Add `lib/techmedix/skills/ar-guidance/index.ts` to skill registry
2. Implement pairing flow for Meta glasses
3. Wire session logging to `ar_guidance_log`

## Verification
- `next build` must pass
- `next lint` must pass  
- Supabase table queryable via `getSupabase()`
- POST to `/api/ar-guidance` returns valid overlay response
