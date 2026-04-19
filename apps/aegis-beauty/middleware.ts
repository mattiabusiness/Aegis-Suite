// ============================================================================
// AEGIS BEAUTY - MIDDLEWARE
// File: apps/aegis-beauty/middleware.ts
// Centralized authentication & route protection
// ============================================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
];

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/onboarding',
];

// Customer sub-routes that require login (/[slug]/prenota and /[slug]/account)
// /[slug] itself is PUBLIC — only prenota and account are protected
const CUSTOMER_PROTECTED_SUBPATHS = ['account', 'prenota'];
const KNOWN_ROOT_PREFIXES = [
  '/dashboard', '/onboarding', '/login', '/register',
  '/forgot-password', '/reset-password', '/auth', '/api', '/_next',
  '/demo', '/legal', '/start', // marketing routes + PWA start — not customer slugs
];

function isCustomerProtectedRoute(pathname: string): boolean {
  // Skip if it matches any known system path
  if (KNOWN_ROOT_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  // Match /[slug]/(account|prenota) — at least 2-char slug
  const match = pathname.match(/^\/([a-z0-9][a-z0-9-]*)\/([a-z]+)(\/.*)?$/);
  if (!match) return false;
  return CUSTOMER_PROTECTED_SUBPATHS.includes(match[2]);
}

// Static/API routes to skip entirely
const SKIP_PREFIXES = [
  '/_next',
  '/api',
  '/favicon',
  '/manifest',
  '/sw',
  '/icons',
  '/images',
];

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API routes, etc.
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Create response to pass through (official Supabase SSR pattern — passes full request
  // so cookie updates in setAll are forwarded to downstream Server Components)
  let response = NextResponse.next({ request });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Re-create response with updated request (reflects the mutated cookies)
          response = NextResponse.next({ request });
          // Set cookies on response (for browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session (important: keeps tokens fresh)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // ── Authenticated user on public routes → redirect to dashboard ──
  // Exception: staff invite QR links must pass through so the staff can register
  const isStaffInvite = request.nextUrl.searchParams.get('staff_invite') === 'true';
  const hasNoAccess = request.nextUrl.searchParams.get('reason') === 'no_access';
  if (isAuthenticated && isPublicRoute && !isStaffInvite && !hasNoAccess) {
    const url = request.nextUrl.clone();
    const rawRedirect = request.nextUrl.searchParams.get('redirect') ?? '';
    // Only honor relative paths that start with / but not // (prevents open redirect)
    const safeRedirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : null;
    // If redirect points to a customer route, honor it (customer already logged in)
    if (safeRedirect && isCustomerProtectedRoute(safeRedirect)) {
      url.pathname = safeRedirect;
      url.search = '';
    } else {
      url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
  }

  // ── Unauthenticated user on protected routes → redirect to login ──
  if (!isAuthenticated && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Preserve the intended destination
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ── Unauthenticated user on customer protected sub-routes ──
  // /[slug]/prenota and /[slug]/account require login
  // /[slug] itself stays PUBLIC
  if (!isAuthenticated && isCustomerProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

// ============================================================================
// MATCHER CONFIG
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};