import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.replace(/^.*?:/, '') ?? '';
  const { pathname } = request.nextUrl;

  // Always let API routes through to Next.js
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Serve static marketing site on blackcatrobotics.com
  if (host === 'blackcatrobotics.com' || host === 'blackcatrobotics.com:443') {
    // Map root to static index.html
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/index.html';
      return NextResponse.rewrite(url);
    }

    // Clean URLs for static pages (about, certifications, habitat-landing, blackcat-grid)
    const cleanRoutes = ['/about', '/certifications', '/habitat-landing', '/blackcat-grid'];
    if (cleanRoutes.includes(pathname) && !pathname.endsWith('.html')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname + '.html';
      return NextResponse.rewrite(url);
    }

    // For any other path on marketing domain, try static files as-is
    // Let Next.js static file handler serve if file exists; otherwise 404
  }

  // dashboard.blackcatrobotics.com → normal Next.js app (dashboard, auth, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except static files, Next.js internals, and images
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
