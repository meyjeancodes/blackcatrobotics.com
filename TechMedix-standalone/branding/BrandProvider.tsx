"use client";

/**
 * branding/BrandProvider.tsx
 *
 * Wraps the entire app. At mount it:
 *  1. Resolves the active BrandTheme
 *  2. Injects every token as a CSS custom property on :root
 *  3. Hooks localStorage for light/dark mode persistence
 *  4. Re-renders if the theme changes (e.g. license key reactivated)
 *
 * Consumers reach tokens via `useBrand()` or the helper hooks.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  BrandTheme,
  resolveBrandTheme,
  defaultTheme,
  getThemeColor,
  getThemeFont,
  isFeatureEnabled,
} from "./theme";

/** Public read-only context shape */
interface BrandContextValue {
  theme: BrandTheme;
  mode: "light" | "dark";
  toggleMode: () => void;
  resolveColor: (token: keyof BrandTheme["colors"]) => string;
  resolveFont: (token: keyof BrandTheme["fonts"]) => string;
  hasFeature: (feature: keyof BrandTheme["features"]) => boolean;
  /** Licensee-facing slug shown in <title> by default */
  appName: string;
}

const BrandContext = createContext<BrandContextValue>({
  theme: defaultTheme,
  mode: defaultTheme.defaultMode,
  toggleMode: () => {},
  resolveColor: getThemeColor,
  resolveFont: getThemeFont,
  hasFeature: isFeatureEnabled,
  appName: defaultTheme.shortName,
});

const STORAGE_KEY = "techmedix-theme";

export function BrandProvider({ children }: { children: ReactNode }) {
  const theme = resolveBrandTheme();
  const [mode, setMode] = useState<"light" | "dark">(defaultTheme.defaultMode);

  // ── Light/dark toggle ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as
        | "light"
        | "dark"
        | null;
      if (stored === "light" || stored === "dark") {
        setMode(stored);
      } else {
        // honour the licensee's default mode
        setMode(theme.defaultMode);
      }
    } catch {
      setMode(theme.defaultMode);
    }
  }, [theme.defaultMode]);

  // ── Apply CSS custom properties to :root ───────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-brand", theme.id);

    // Colors
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${camelToKebab(key)}`, value);
    }

    // Fonts
    for (const [key, value] of Object.entries(theme.fonts)) {
      root.style.setProperty(`--font-${camelToKebab(key)}`, value);
    }

    root.style.setProperty("--brand-primary", theme.colors.primary);
    root.style.setProperty("--border-radius", theme.meta.borderRadius ?? "1rem");

    // Apply light/dark data attribute
    root.setAttribute("data-theme", mode);
  }, [theme, mode]);

  const toggleMode = () => {
    setMode((m) => {
      const next = m === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // private mode
      }
      return next;
    });
  };

  const ctx = useMemo<BrandContextValue>(
    () => ({
      theme,
      mode,
      toggleMode,
      resolveColor: getThemeColor,
      resolveFont: getThemeFont,
      hasFeature: isFeatureEnabled,
      appName: theme.shortName,
    }),
    [theme, mode],
  );

  return <BrandContext.Provider value={ctx}>{children}</BrandContext.Provider>;
}

/** ── Hooks ─────────────────────────────────────────────────────────────── */

export function useBrand(): BrandContextValue {
  return useContext(BrandContext);
}

export function useBrandColor(token: keyof BrandTheme["colors"]): string {
  return useContext(BrandContext).resolveColor(token);
}
export function useBrandFont(token: keyof BrandTheme["fonts"]): string {
  return useContext(BrandContext).resolveFont(token);
}
export function useFeature(feature: keyof BrandTheme["features"]): boolean {
  return useContext(BrandContext).hasFeature(feature);
}

/** ── Internal helpers ──────────────────────────────────────────────────── */

function camelToKebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([a-z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

export default BrandProvider;
