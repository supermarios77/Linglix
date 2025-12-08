import createMiddleware from "next-intl/middleware";
import { auth } from "@/config/auth";
import { NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

/**
 * Next.js 16 Middleware
 * 
 * Combines i18n routing (next-intl) with authentication (NextAuth)
 * 
 * Order of operations:
 * 1. i18n middleware handles locale detection and routing
 * 2. Auth middleware handles route protection
 * 
 * Production considerations:
 * - Runs on Edge Runtime for performance
 * - Minimal logic to reduce latency
 * - Proper error handling
 */

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Always show locale in URL (e.g., /en, /es)
});

// Combine i18n and auth middleware
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Extract locale from pathname (e.g., /en/dashboard -> /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth",
    "/api/auth",
  ];

  // Check if route is public (without locale prefix)
  const isPublicRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // First, handle i18n routing
  const intlResponse = intlMiddleware(req);

  // If i18n middleware returns a redirect, use it
  if (intlResponse && intlResponse.status === 307) {
    return intlResponse;
  }

  // Then, handle authentication
  // Allow public routes and API auth routes
  if (isPublicRoute || pathname.startsWith("/api/auth")) {
    return intlResponse || NextResponse.next();
  }

  // Redirect to sign in if not authenticated
  if (!isLoggedIn) {
    // Get locale from pathname or use default
    const locale = pathname.split("/")[1] || defaultLocale;
    const signInUrl = new URL(`/${locale}/auth/signin`, req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlResponse || NextResponse.next();
});

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - image files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
