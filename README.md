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

## Aftermarket parts store (real checkout)

The site sells genuine Unitree H1 replacement parts through **Stripe Checkout**.

- Catalog (single source of truth): [`TechMedix-standalone/lib/store/parts-catalog.ts`](TechMedix-standalone/lib/store/parts-catalog.ts)
- Checkout API: [`TechMedix-standalone/app/api/checkout/route.ts`](TechMedix-standalone/app/api/checkout/route.ts) (server-side `stripe.checkout.sessions.create`)
- Storefront page: [`TechMedix-standalone/app/store/page.tsx`](TechMedix-standalone/app/store/page.tsx) (`/store`)
- Success / cancel: `app/store/success` and `app/store/cancel`

Wiring:
- Homepage Aftermarket tab "Order Part" buttons call `buyPart(sku)` (inline in `public/index.html`) → `POST /api/checkout` → redirect to Stripe.
- Aftermarket H1 parts render the real `h1.urdf` model (see `lib/platforms/urdf-config.ts`).

Env (production, Vercel project `techmedix`):
```
STRIPE_SECRET_KEY=sk_live_...        # server-only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # optional, for embedded Elements later
NEXT_PUBLIC_SITE_URL=https://blackcatrobotics.com
# Optional pre-created Price IDs: STRIPE_PRICE_<SKU> (e.g. STRIPE_PRICE_H1-KNEE-ACT=price_xxx)
```
If `STRIPE_PRICE_<SKU>` is unset the API falls back to inline `price_data` built from `unitAmount`, so the store works without pre-creating Stripe products. Use a `sk_test_...` key to exercise the flow without real charges.

## Divisions: Habitat (AI home construction) & Grid (infrastructure intelligence)

Two sub-brands appear in the marketing nav:
- **BlackCat Habitat** — AI-driven home construction. Standalone page: `TechMedix-standalone/public/habitat.html`.
- **BlackCat Grid** — infrastructure intelligence (data centers, energy, network). Standalone page: `TechMedix-standalone/public/blackcat-grid.html`.

Both are linked from the homepage nav "Divisions" dropdown. Active development focus (see roadmap): double down on Habitat and Grid as competitors enter the AI-home-building space.

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

