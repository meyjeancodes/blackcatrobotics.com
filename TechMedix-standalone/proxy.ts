import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/fleet",
  "/alerts",
  "/dispatch",
  "/billing",
  "/settings",
  "/admin",
  "/onboarding",
  "/nodes",
  "/maintenance",
  "/datacenter",
  "/network",
  "/operations",
  "/energy",
  "/grid",
];

const AUTH_ROUTES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  try {
    const host = request.headers.get("host") || "";
    const { pathname } = request.nextUrl;

    // Redirect www to apex domain
    if (host === "www.blackcatrobotics.com") {
      const url = request.nextUrl.clone();
      url.host = "blackcatrobotics.com";
      return NextResponse.redirect(url, 301);
    }

    // Serve HABITAT landing page on habitat.blackcatrobotics.com
    if (host === "habitat.blackcatrobotics.com") {
      if (pathname === "/" || pathname === "") {
        const url = request.nextUrl.clone();
        url.pathname = "/habitat.html";
        return NextResponse.rewrite(url);
      }
      // /design and all other paths pass through to Next.js routing
      return NextResponse.next({ request });
    }

    // NOTE: blackcatrobotics.com "/" used to be force-rewritten to the legacy
    // static public/index.html here, which meant real visitors never saw the
    // React homepage even after it was updated. That rewrite is removed —
    // "/" now falls through to app/(marketing)/page.tsx like every other
    // route. /about has no live target (about.html doesn't exist) and is
    // left to 404 until it's rebuilt; /habitat-landing and /blackcat-grid
    // still serve their legacy static pages for now pending the HABITAT /
    // BlackCat Grid content decisions.
    if (host === "blackcatrobotics.com" || host === "blackcatrobotics.com:443") {
      const cleanRoutes = ["/habitat-landing", "/blackcat-grid"];
      if (cleanRoutes.includes(pathname) && !pathname.endsWith(".html")) {
        const url = request.nextUrl.clone();
        url.pathname = pathname + ".html";
        return NextResponse.rewrite(url);
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

    if (!user && isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
