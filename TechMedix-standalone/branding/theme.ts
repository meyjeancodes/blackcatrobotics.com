"use client";

/** ─────────────────────────────────────────────────────────────────────────────
 *
 *  TechMedix White-Label Branding System
 *  ▸ Every visual token flows from this provider
 *  ▸ At boot, a BrandBoot component injects licensee overrides
 *  ▸ To create a new brand: add a theme file under /themes and set
 *    BRAND_THEME=brand-name in .env
 *
 *  Licensees self-host on their own Vercel project — BlackCat only provides
 *  the bundled, licensed artifact. No runtime call-home required.
 *
 *  Licensing model:
 *    • Perpetual license   – $4,800/project (no recurring fee)
 *    • Maintenance SaaS    – $280/mo per project (includes security patches + support)
 *    • Volume (3+)         – $3,600/project (perpetual)
 *
 *  Licensee ID is watermarked in build output. Tampering voids warranty.
 * ───────────────────────────────────────────────────────────────────────────*/

export type BrandTheme = {
  id: string;
  /** Display name shown in licensee admin */
  name: string;
  /** Long-form: "AcmeMedical Robotics Dashboard" */
  fullName: string;
  /** Short: "AcmeMed" — used in <title>, sidebar header */
  shortName: string;
  /** Emoji or shortword — used as sidebar icon fallback */
  icon: string;

  /** ── Color palette ────────────────────────────────────────────────────
   *  Every value is a CSS <color> string: hex, oklch(), rgb()... */
  colors: {
    /** Danger zone. Header bg, brand strips, active nav indicator. */
    primary: string;
    /** Medium emphasis. Muted headings, active states. */
    secondary: string;
    /** Accent highlight. Links, badges, KPI glow. */
    accent: string;
    /** Background / page bg. */
    surface: string;
    /** Card / panel background (usually slightly lighter than surface). */
    paper: string;
    /** Default body text. */
    ink: string;
    /** Secondary / muted text. */
    inkSoft: string;
    /** Positive status — success, online. */
    statusOk: string;
    /** Warning status. */
    statusWarn: string;
    /** Danger status. */
    statusDanger: string;
    /** Focus ring color. */
    focusRing: string;
  };

  /** ── Typography ─────────────────────────────────────────────────────── */
  fonts: {
    header: string;   /** Display / hero font CSS family string */
    body: string;     /** Body content font CSS family string */
    ui: string;       /** Nav, labels, monospace UI font */
  };

  /** ── Theme mode defaults ────────────────────────────────────────────── */
  defaultMode: "light" | "dark";

  /** ── Feature toggles ──────────────────────────────────────────────────
   *  Licensees can opt-out of modules they don't own the data for. */
  features?: {
    urdfViewer: boolean;
    droneFleet: boolean;
    maintenanceModule: boolean;
    aiInsights: boolean;
    billingStripe: boolean;
    telemetryCharts: boolean;
  };

  /** ── Meta ───────────────────────────────────────────────────────────── */
  meta: {
    /** Tracking code injected in <head> */
    analyticsId?: string;
    /** Favicon filename in /public/ */
    favicon?: string;
    /** Border radius base */
    borderRadius?: string;
  };

  /** Optional URL override for the licensee's hosted instance */
  siteUrl?: string;
};

/** BlackCat Robotics – default full-production theme */
export const defaultTheme: BrandTheme = {
  id: "blackcat",
  name: "BlackCat Robotics",
  fullName: "BlackCat Robotics Dashboard",
  shortName: "BlackCat",
  icon: "🐱",
  colors: {
    primary: "#e8601e",
    secondary: "#c3a55b",
    accent: "#1db87a",
    surface: "#17181d",
    paper: "#f2f0eb",
    ink: "#0c0d11",
    inkSoft: "#5a5e68",
    statusOk: "#1db87a",
    statusWarn: "#c3a55b",
    statusDanger: "#e8601e",
    focusRing: "#e8601e",
  },
  fonts: {
    header: "'Tanker', sans-serif",
    body: "'Satoshi', 'Helvetica Neue', sans-serif",
    ui: "'Chakra Petch', monospace",
  },
  defaultMode: "dark",
  features: {
    urdfViewer: true,
    droneFleet: true,
    maintenanceModule: true,
    aiInsights: true,
    billingStripe: true,
    telemetryCharts: true,
  },
  meta: {
    borderRadius: "1rem",
  },
};

/** Sampler of pre-built licensee themes */
export const LICENSEE_THEMES: Record<string, BrandTheme> = {
  blackcat: defaultTheme,

  medcore: {
    id: "medcore",
    name: "MedCore Surgical",
    fullName: "MedCore Surgical Dashboard",
    shortName: "MedCore",
    icon: "⚕️",
    colors: {
      primary: "#0057b8",
      secondary: "#00a9ce",
      accent: "#ff6f00",
      surface: "#0d1b2a",
      paper: "#f4f6f9",
      ink: "#1b263b",
      inkSoft: "#5c677d",
      statusOk: "#00c853",
      statusWarn: "#ffab00",
      statusDanger: "#d50000",
      focusRing: "#0057b8",
    },
    fonts: {
      header: "'Inter', sans-serif",
      body: "'Inter', sans-serif",
      ui: "'JetBrains Mono', monospace",
    },
    defaultMode: "light",
    features: {
      urdfViewer: true,
      droneFleet: false,
      maintenanceModule: true,
      aiInsights: false,
      billingStripe: true,
      telemetryCharts: true,
    },
    meta: { borderRadius: "0.5rem" },
  },

  aeroflt: {
    id: "aeroflt",
    name: "AeroFluidics",
    fullName: "AeroFluidics Fleet Monitor",
    shortName: "AeroFluid",
    icon: "✈️",
    colors: {
      primary: "#1a237e",
      secondary: "#3949ab",
      accent: "#00e5ff",
      surface: "#0a0e27",
      paper: "#e8eaf6",
      ink: "#0a0e27",
      inkSoft: "#7986cb",
      statusOk: "#00e676",
      statusWarn: "#ffea00",
      statusDanger: "#ff1744",
      focusRing: "#00e5ff",
    },
    fonts: {
      header: "'Rajdhani', 'Oswald', sans-serif",
      body: "'Inter', sans-serif",
      ui: "'Share Tech Mono', monospace",
    },
    defaultMode: "dark",
    features: {
      urdfViewer: false,
      droneFleet: true,
      maintenanceModule: true,
      aiInsights: true,
      billingStripe: false,
      telemetryCharts: true,
    },
    meta: { borderRadius: "0rem" },
  },
};

/** ── Runtime override source ──────────────────────────────────────────────
 *
 *  Priority (highest → lowest):
 *    1. window.__TECHMEDIX_BRAND__ (injected by BrandBoot as inline JSON)
 *    2. process.env.NEXT_PUBLIC_BRAND_THEME  → resolve from LICENSEE_THEMES
 *    3. defaultTheme
 *
 *  Licensees deploy self-host; they control their own env. The water-marked
 *  build artifact never phone home. BlackCat verifies license via key in
 *  siteUrl query param on first deploy, then enforces via build hash.
 */

let _runtimeTheme: BrandTheme | null = null;

function getRuntimeOverride(): BrandTheme | null {
  try {
    if (typeof window !== "undefined" && (window as any).__TECHMEDIX_BRAND__) {
      return (window as any).__TECHMEDIX_BRAND__ as BrandTheme;
    }
  } catch {
    // ignore SSR
  }
  return null;
}

export function resolveBrandTheme(): BrandTheme {
  if (_runtimeTheme) return _runtimeTheme;

  const override = getRuntimeOverride();
  if (override) {
    _runtimeTheme = override;
    return override;
  }

  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BRAND_THEME) {
    const envId = process.env.NEXT_PUBLIC_BRAND_THEME;
    if (LICENSEE_THEMES[envId]) {
      _runtimeTheme = LICENSEE_THEMES[envId];
      return _runtimeTheme;
    }
  }

  _runtimeTheme = defaultTheme;
  return defaultTheme;
}

export function getThemeColor(token: keyof BrandTheme["colors"]): string {
  return resolveBrandTheme().colors[token];
}

export function getThemeFont(token: keyof BrandTheme["fonts"]): string {
  return resolveBrandTheme().fonts[token];
}

export function isFeatureEnabled(feature: keyof BrandTheme["features"]): boolean {
  return resolveBrandTheme().features?.[feature] ?? true;
}
