# White-Label Licensing — TechMedix Dashboard Platform

You are looking at **reusable IP**. The dashboard is a complete robotics/medical product: URDF visualizer, parts database, knowledge hub, fleet telemetry, maintenance/triage system, AI insights, Stripe billing.

This directory is the **licensing layer**. It gives every licensee:
1. A self-hosted branded instance
2. A `BrandProvider` that reskins every token in one file
3. A vehicle for recurring revenue, version upgrades, and commercial protection

---

## 1. The IP being licensed

| Asset | Value |
|---|---|
| `urdf-viewer` + `robot-model-viewer` + `blueprint-explorer` | 3D/orthographic URDF visualization stack |
| `app/page.tsx`, `dashboard-shell`, `sidebar` | Full app navigation and shell |
| `lib/atlas...` | Parts supply-chain / BOM DB engine |
| `components/*-panel`, `*-table` | Fleet/telemetry/incident maintenance modules |
| `urdf-loader`, mesh pipeline, Draco support | Build tooling |
| Stripe payment integration | Production billing layer |
| Supabase auth schema | RLS-backed multi-tenant auth |

Licensee inherits the **whole stack** licensed as one titled product, not as individual components.

---

## 2. License types

### A. Perpetual (on-prem)
- Licensee buys the licensed artifact, holds it on their own infra
- They can fork, configure, and deploy freely within the scope
- No BlackCat telemetry, no license server ping
- BlackCat receives nothing beyond the upfront fee

**Price**: US$4,800/project (≤1 domain). Volume discount (3+ projects): US$3,600/project.

### B. Managed SaaS (recommended default)
- Licensee pays $280/mo per project for:
  - Security patches and minor version upgrades
  - Support SLA (email, 3 business days)
  - New brand templates each quarter
- BlackCat hosts nothing — fee is a service agreement
- Licensee still self-hosts; BlackCat delivers patch bundles via git

**Renewal**: Annual commitment, auto-renews unless terminated 30 days before endpoint.

### C. Enterprise custom
- Source-available license for a negotiated price
- BlackCat in-house customization
- SLA: 24h response, dedicated channel
- Price: negotiable, typically starts $18,000/year

---

## 3. Branding architecture

### 3.1. The `branding/` directory

```
branding/
  theme.ts                     ← Core theme types + built-in licensees
  BrandProvider.tsx            ← React context wrapping the whole app
  overrides/                   ← Licensee-specific patches (CSS, public/)
    {licensee-id}/
```

A **BrandProvider** wraps the whole app. It:
1. Reads `NEXT_PUBLIC_BRAND_THEME` at build/resolve time
2. Injects every color/font token as CSS custom properties on `:root`
3. Sets data attributes for mode and brand id on `<html>`
4. Supplies `useBrand()`, `useBrandColor()`, `useBrandFont()`, `useFeature()`

All components already reference CSS variables, so reskin proceeds automatically.

### 3.2. Adding new licensee themes

Licensee on-boarding:

```bash
# Licensee clones an INSTALLED artifact (not this repo)
# or receives a tarball from BlackCat
cp branding/overrides/medcore-med.localconfig.ts branding/overrides/their-id/
```

**Licensee config file** (one file per licensee, stored out-of-band from the public repo):

```
# .env.local in the licensee's Self-Hosted Project
NEXT_PUBLIC_BRAND_THEME=medcore   # maps to LICENSEE_THEMES[medcore]
BRAND_OVERRIDE_FILE=/branding/overrides/medcore/custom.ts
```

Custom overrides **patch** the LICENSEE_THEMES entry, not replace it, so BlackCat can always upgrade and diff.

### 3.3. White-label feature flags

Every module is gated via `isFeatureEnabled()`:

```tsx
import { useFeature } from "@/branding/BrandProvider";

export function MaintenanceSection() {
  const enabled = useFeature("maintenanceModule");
  if (!enabled) return null;
  // ... full maintenance UI
}
```

Licensees who only need a parts explorer can turn off telemetry, drones, billing, etc.

---

## 4. Passive-income mechanics

### 4.1. Perpetual upfront revenue

A robotics/medical company wants the platform and wants control of their data.

- Step 1: BlackCat pulls the licensed artifact for that licensee (a tagged git bundle, or a Vercel deploy-redirect)
- Step 2: Invoice $4,800
- Step 3: Licensee deploys to their own Vercel/Render/AWS
- Step 4: Invoice a second payment for onboarding assistance (first 30 days)

No recurring cost to BlackCat. Revenue scales linearly with licensees.

### 4.2. Maintenance SaaS (recurring revenue)

The license agreement includes:

> *"Licensee grants BlackCat the right to deliver quarterly patch bundles. Refusal voids support entitlement."*

BlackCat ships a signed git bundle each quarter. No runtime license check is required, but the build artifact contains a license id that appears in meta tags and the legal footer. Tampering with or removing the license id voids the warranty clause.

### 4.3. Volume discounts (scale)

For OEM reseller or dealer channel:
- 3+ projects: $3,600 each
- 10+: $2,800 each
- White-label OEM access (custom modules OK): private quote

BlackCat keeps source code private; reseller cannot fork and resell the license as their own IP.

### 4.4. Upsell paths from blackcat-owned site

BlackCat's own site (Dashboard) shows feature parity with each licensee module. A licensee paying $280/mo stays on the bleeding edge without needing to hire a Three.js engineer.

A licensee who opts into perpetuity but wants a new module can purchase it as a one-shot enhancement or upgrade to Managed SaaS.

---

## 5. Production checklist before licensing

1. **Remove TechMedix/BlackCat specific branding** in marketing pages that licensees will see — replace with BrandProvider call
2. **Confirm Supabase schema is generic** (remove mids like `techmedix` from table names)
3. **Strip internal tools** not in LICENSEE_THEMES `features` map from the production build
4. **Scrub `.env.local`** — credentials must never be in the licensed artifact
5. **Tag a build**: `git tag -a v1.0.0-license-YYYYMMDD -m "Licensed build"`
6. **Output the licensed tarball** from that tag, not `main`
7. **Send the agreement** with invoice specifying the scope of modules inherited

---

## 6. Pricing summary

| Tier | Upfront | Ongoing | Modules included |
|---|---|---|---|
| Perpetual | $4,800/project | $0 | All 6 |
| Perpetual (vol 3+) | $3,600/project | $0 | All 6 |
| Managed SaaS | $0 | $280/mo | All 6 + support |
| Enterprise custom | Negotiated | Negotiated | All + custom |

Fee is per self-hosted project domain. Licensee can self-deploy to as many subdomains as they own.

---

## 7. What's next

1. The `branding/BrandProvider.tsx` file is live. It is the runtime reskin.
2. You want a new licensee branded? Add to `LICENSEE_THEMES` in `theme.ts` and ship.
3. To create a licensed tarball for a customer, let me know the licensee identity and
   I'll produce a patch script, the license tag, and a white-label package spec.
