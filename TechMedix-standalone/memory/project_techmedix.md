---
name: TechMedix project overview
description: Architecture, stack, and current state of the TechMedix fleet dashboard app
type: project
---

TechMedix is a Next.js 14 App Router fleet maintenance dashboard built for BlackCat Robotics. Lives at ~/Desktop/BlackCat Robotix/TechMedix-standalone.

**Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (@supabase/supabase-js + @supabase/ssr), Lucide React icons.

**Theme:** Dark bg (`surface: #17181d`, `ink: #0c0d11`), white text, ember accent (`#e8601e`). Custom CSS classes: `.panel` (light card), `.panel-dark` (dark card), `.kicker` (small caps label), `.metric-value` (large serif number).

**Route groups:**
- `(auth)` — `/login`, `/signup`, `/onboarding` — no sidebar, dark centered layout
- `(dashboard)` — all other routes — sidebar + shell layout
- `(marketing)` — `/` landing page

**Auth (completed):** Full Supabase email/password auth with SSR-compatible cookie sessions.
- `lib/supabase-browser.ts` — `createBrowserClient` for client components
- `lib/supabase-server.ts` — `createSupabaseServerClient()` for server components
- `middleware.ts` — protects /dashboard, /fleet, /alerts, /dispatch, /billing, /settings, /admin, /onboarding; redirects auth'd users away from /login and /signup
- Signup flow: creates auth user → inserts `customers` (name, slug, billing_email, plan='operator', status='trial') + `user_profiles` (user_id, customer_id, full_name, email, global_role='customer_admin')
- Onboarding: 2-step wizard; robot insert into `robots` (customer_id, name, platform, serial_number, location, status='online')
- Sidebar shows logged-in user name/email + sign out button

**DB tables:** customers, user_profiles, customer_memberships, robots, alerts, jobs, technicians, diagnostic_reports, telemetry_snapshots, api_keys

**Data layer:** `lib/data.ts` — toggle between mock data (`TECHMEDIX_USE_MOCK_DATA=true`) and live Supabase. Do NOT modify `lib/data.ts`, `lib/supabase.ts`, or `lib/shared/`.

**Why:** `lib/supabase.ts` is the original basic client — kept unchanged per project constraint. New SSR-compatible clients are in separate files.
