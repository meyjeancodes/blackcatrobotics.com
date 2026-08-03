# BlackCat Robotics — blackcatrobotics.com

Monorepo for [blackcatrobotics.com](https://blackcatrobotics.com). Two surfaces ship from one repo:

- **Marketing homepage** — the static site served at the apex domain (`/` and the `/acquire` platform catalog). Source: [`TechMedix-standalone/public/index.html`](TechMedix-standalone/public/index.html). Deploys via Vercel (`techmedix` project) with no app build step for the homepage itself.
- **TechMedix / BlackCat OS** — the AI maintenance-intelligence dashboard + fleet app. Source: [`TechMedix-standalone/`](TechMedix-standalone). Full-stack Next.js + Supabase.

## TechMedix is free and open source

TechMedix (the diagnostics engine) is open source. Self-host it or use the managed option. The "Download Free" button on the site links here.

## Clone and run (local dev)

```bash
git clone https://github.com/meyjeancodes/blackcatrobotics.com.git
cd blackcatrobotics.com/TechMedix-standalone
npm install
cp .env.example .env.local   # then fill in Supabase + API keys (see TechMedix-standalone/README.md)
npm run dev
```

App docs and the Supabase migration/seed order live in [`TechMedix-standalone/README.md`](TechMedix-standalone/README.md).

## Editing the homepage

The homepage is a single static file — `TechMedix-standalone/public/index.html`. Edit it directly and deploy (`vercel --prod` from `TechMedix-standalone`, or push to `main`). No Next.js rebuild is required for content changes, but the site is served through the Vercel `techmedix` project, so a deploy promotes the change.

## Repo layout

```
blackcatrobotics.com/
├─ TechMedix-standalone/   # Next.js app + static homepage (public/index.html)
│  ├─ app/                 # dashboard / (auth) / (public) routes
│  ├─ public/              # static homepage + assets
│  └─ README.md            # app setup + Atlas data
├─ blackcat-os/            # BlackCat OS robotics platform
├─ certifications/         # certification curriculum content
└─ ...
```

## Deploy

- Homepage + app: Vercel project `techmedix` (root = `TechMedix-standalone`), alias `blackcatrobotics.com`.
- Dashboard subdomain: `dashboard.blackcatrobotics.com` (same Vercel project, separate route).

_Note: the static homepage is currently served through the same Vercel project as the Next.js app. See issue #B for the planned split to a standalone static host so homepage edits deploy independently of the app build._

