import { NextRequest, NextResponse } from "next/server";

// Subdomain routing for the dashboard.
// dashboard.blackcatrobotics.com -> TechMedix Operations console (app/(dashboard)).
// All other hosts (incl. blackcatrobotics.com / www) -> marketing site as usual.
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isDashboard = host.startsWith("dashboard.");

  if (isDashboard && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|robots.txt|sitemap.xml).*)"],
};
