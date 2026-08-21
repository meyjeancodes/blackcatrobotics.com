import { NextRequest, NextResponse } from "next/server";

// Route the dashboard subdomain to the authenticated dashboard app.
// dashboard.blackcatrobotics.com/*  ->  /dashboard/*
// The (dashboard) route group is auth-gated: /dashboard -> 307 /login when
// no session. Auth routes (/login, /signup, /onboarding) live at the root
// path (not under /dashboard), so we must NOT rewrite them — otherwise the
// post-redirect /login request would wrongly become /dashboard/login (404).
const DASHBOARD_HOST = "dashboard.blackcatrobotics.com";

// Auth routes that must be served at their real root paths.
const AUTH_ROUTES = ["/login", "/signup", "/onboarding"];

export function middleware(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const bare = host.split(":")[0].toLowerCase();

  if (bare !== DASHBOARD_HOST) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Auth flows: serve at real path, no rewrite.
  if (AUTH_ROUTES.includes(pathname)) return NextResponse.next();

  // Already under /dashboard: leave as-is (handles /dashboard/login etc.).
  if (pathname.startsWith("/dashboard")) return NextResponse.next();

  // Everything else on the subdomain -> /dashboard.
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? "/dashboard" : `/dashboard${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on everything except static assets / _next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|images|icons|robots.txt|sitemap.xml).*)"],
};
