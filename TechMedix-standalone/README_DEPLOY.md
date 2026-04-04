# TechMedix — Vercel Deployment Guide

## Prerequisites
- Node.js 18+
- Vercel account (vercel.com)
- All environment variables from `.env.production.example`

---

## Step-by-Step Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Initialize project (from TechMedix-standalone/)
```bash
vercel
```
When prompted:
- **Project name:** `techmedix-blackcat`
- **Link to existing project or create new:** create new
- **Root directory:** `./` (current directory)
- Accept detected Next.js framework settings

### 4. Set environment variables
Add each variable from `.env.production.example` via CLI:

```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add BLACKCAT_API_SECRET production
vercel env add HUGGINGFACE_API_TOKEN production
vercel env add VLA_INFERENCE_SERVER_URL production
vercel env add ATLAS_API_KEY production
```

Or add them in bulk via the Vercel dashboard:
**Project → Settings → Environment Variables**

### 5. Set custom domain
**Target:** `dashboard.blackcatrobotics.com`

In Vercel dashboard:
- **Settings → Domains → Add domain**
- Enter: `dashboard.blackcatrobotics.com`

In your DNS provider, add:
```
Type:  CNAME
Name:  dashboard
Value: cname.vercel-dns.com
TTL:   Auto
```

### 6. Deploy to production
```bash
vercel --prod
```

---

## Vercel Cron Jobs
The simulation engine runs nightly via Vercel Cron (defined in `vercel.json`):
- **Path:** `/api/simulation/run`
- **Schedule:** `0 0 * * *` (midnight UTC daily)

Vercel auto-generates `CRON_SECRET` — add it to your `.env.local` for local testing.

---

## Stripe Webhook Setup
After deploying, configure your Stripe webhook endpoint:
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://dashboard.blackcatrobotics.com/api/stripe/webhook`
3. Events to listen for: `checkout.session.completed`, `customer.subscription.*`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Supabase Setup
1. Run migrations: `supabase db push` (requires Supabase CLI)
2. Or apply SQL files in `supabase/migrations/` via Supabase dashboard SQL editor
3. Seed data: `npm run atlas:seed` (requires `ATLAS_API_KEY`)

---

## Troubleshooting
- **Build fails:** Run `npm run build` locally first — must be 0 errors
- **TypeScript errors:** Run `npm run typecheck`
- **Middleware warning:** The `middleware` file convention deprecation warning is non-blocking
- **NFT trace warning:** Non-blocking Turbopack warning from `next.config.mjs` dynamic imports
