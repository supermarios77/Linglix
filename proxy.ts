import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { auth } from "@/config/auth";
import { locales, defaultLocale } from "@/i18n/config";

/**
 * Next.js 16 Proxy
 * 
 * Handles network boundary operations at the edge:
 * - i18n routing (locale detection and redirects)
 * - Authentication (route protection)
 * 
 * Production considerations:
 * - Runs on Node.js runtime (Next.js 16 proxy standard)
 * - Minimal logic to reduce latency
 * - Proper error handling
 * - SEO-friendly locale routing
 * - Integrated with NextAuth v5 and next-intl
 * 
 * Note: NextAuth's auth() returns a middleware function that we wrap.
 * This is the recommended pattern for combining multiple middleware functions.
 */

// Create i18n middleware for locale routing
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Always show locale in URL (e.g., /en, /es)
});

/**
 * Proxy function - handles all incoming requests
 * 
 * Order of operations:
 * 1. i18n middleware handles locale detection and routing
 * 2. Auth middleware handles route protection
 * 
 * This uses NextAuth's auth() wrapper pattern which returns a middleware function.
 * The default export is the standard pattern for Next.js 16 proxy.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // First, handle i18n routing
  const intlResponse = intlMiddleware(req);

  // If i18n middleware returns a redirect, use it
  if (intlResponse && intlResponse.status === 307) {
    return intlResponse;
  }

  // Extract locale from pathname (e.g., /en/dashboard -> /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

  // Public routes that don't require authentication (without locale prefix)
  const publicRoutes = ["/", "/auth", "/tutors"];
  
  // Admin routes - require ADMIN role (checked in page component)
  const isAdminRoute = pathnameWithoutLocale.startsWith("/admin");

  // Check if route is public (without locale prefix)
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(`${route}/`)
  );

  // Skip auth check for API routes
  if (pathname.startsWith("/api/")) {
    return intlResponse || NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return intlResponse || NextResponse.next();
  }

  // Redirect to sign in if not authenticated
  if (!isLoggedIn) {
    // Get locale from pathname or use default
    const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)/);
    const locale = localeMatch ? localeMatch[1] : defaultLocale;
    const signInUrl = new URL(`/${locale}/auth/signin`, req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlResponse || NextResponse.next();
});

/**
 * Configure which routes the proxy should run on
 * 
 * Matches all routes except:
 * - API routes (handled separately)
 * - Static files (_next/static)
 * - Image optimization (_next/image)
 * - Favicon
 * - Public assets (images, etc.)
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};