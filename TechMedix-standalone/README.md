# BlackCat OS

Humanoid robot maintenance platform by BlackCat Robotics. Full-stack Next.js app with Supabase backend, AI-powered AR guidance, and Atlas-sourced supply chain data.

## Setup

### 1. Environment variables

Copy `.env.local` and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)
ANTHROPIC_API_KEY=               # For /api/ar-guidance
ATLAS_API_KEY=                   # Atlas CLI / API key
ATLAS_BASE_URL=https://api.humanoidatlas.com
```

### 2. Database

Run migrations in Supabase SQL editor in order:

```sql
-- 1. Core schema (existing)
supabase/migrations/001_schema.sql

-- 2. BlackCat OS tables
supabase/migrations/002_blackcat_os.sql

-- 3. Base seed data
supabase/seed.sql

-- 4. BlackCat OS seed (Atlas-sourced Unitree H1 data)
supabase/seed_blackcat_os.sql
```

### 3. Install and run

```bash
npm install
npm run dev
```

## Atlas Data

All robot, component, and supplier data is sourced from the [Humanoid Atlas](https://humanoidatlas.com) CLI.

### Re-pull Atlas data

```bash
npm run atlas:pull          # Runs scripts/pull-atlas.sh → saves to .atlas/
npm run atlas:seed          # Parses .atlas/ → writes supabase/seed_atlas_generated.sql
```

Raw Atlas JSON files are stored in `.atlas/`:
- `companies.json` — all OEM companies
- `components.json` — component categories
- `relationships.json` — supply chain relationships
- `unitree_supply_chain.json` — Unitree supply graph
- `unitree_profile.json` — Unitree company + supplier list
- `h1_query.json` — LLM query result for H1 components

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview tiles with live Supabase stats |
| `/ar-mode` | Full-screen AR robot body SVG with zone click → procedure steps + AI guidance |
| `/maintenance` | Job list with status filter + procedure side panel + AI guidance |
| `/certifications` | Level 1–5 cert cards with module checklist + AI score progress |
| `/acquire` | Atlas-sourced supplier catalog with component/region filters |
| `/technicians/certifications` | Legacy technician certification flow |

## API Routes

| Route | Description |
|-------|-------------|
| `POST /api/ar-guidance` | Claude Sonnet AR guidance for a procedure step |
| `GET /api/atlas/[...route]` | Server-side Atlas API proxy (key stays server) |

### AR Guidance request shape

```json
{
  "step_instruction": "Remove 4× M5 motor mounting bolts...",
  "component_name": "PMSM Joint Motor — Hip (Left)",
  "warnings": ["Do not let motor drop onto reducer coupling."]
}
```

## PWA

- Manifest: `public/manifest.json`
- Service worker: `public/sw.js` (caches offline pages, network-first for API)
- Add to home screen supported on iOS and Android

## Mobile (Capacitor)

Capacitor is scaffolded in `capacitor.config.ts`. To build for iOS/Android:

```bash
# Install Capacitor packages first
npm install --save-dev @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android

npm run cap:add:ios       # Add iOS platform
npm run cap:add:android   # Add Android platform
npm run cap:sync          # Build + sync native projects
```

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Supabase (Postgres + Auth + RLS)
- **AI**: Anthropic SDK, `claude-sonnet-4-20250514`
- **Data**: Atlas CLI / Humanoid Atlas API
- **Mobile**: Capacitor (scaffolded)
- **PWA**: Custom service worker

## File Structure

```
.atlas/                    Raw Atlas CLI JSON
app/
  (dashboard)/
    ar-mode/               AR body viewer
    maintenance/           Job list + procedure panel
    certifications/        Level 1-5 cert cards
    acquire/               Supplier catalog
  api/
    ar-guidance/           Anthropic AI endpoint
    atlas/[...route]/      Atlas proxy
components/
  RobotBodySVG.tsx         Interactive SVG body diagram
lib/
  atlas.ts                 Atlas API wrapper (server)
  anthropic.ts             Anthropic client singleton
  supabase*.ts             Supabase clients
scripts/
  pull-atlas.sh            Re-pull all Atlas CLI data
  atlas-to-seed.ts         Generate seed SQL from Atlas JSON
supabase/
  migrations/001_schema.sql
  migrations/002_blackcat_os.sql
  seed.sql
  seed_blackcat_os.sql     Atlas-sourced Unitree H1 data
types/
  atlas.ts                 TypeScript interfaces for Atlas + DB types
```
