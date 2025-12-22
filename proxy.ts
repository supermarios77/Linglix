import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { auth } from "@/config/auth";
import { locales, defaultLocale } from "@/config/i18n/config";
import { logger } from "@/lib/logger";
import {
  isExcludedRoute,
  isPublicRoute,
  isApiRoute,
  extractLocale,
  createSignInUrl,
} from "@/lib/middleware/utils";
import { HTTP_STATUS } from "@/lib/middleware/constants";

/**
 * Next.js 16 Proxy (Middleware)
 * 
 * Handles network boundary operations at the edge:
 * - i18n routing (locale detection and redirects)
 * - Authentication (route protection)
 * 
 * Best Practices Applied:
 * - Lightweight and efficient (minimal logic)
 * - Modular helper functions
 * - Proper error handling
 * - Constants extracted to separate file
 * - SEO-friendly locale routing
 * - Integrated with NextAuth v5 and next-intl
 * 
 * Note: NextAuth's auth() returns a middleware function that we wrap.
 * This is the standard pattern for combining multiple middleware functions.
 */

// Create i18n middleware for locale routing
// Note: We handle sitemap/robots exclusion in the main middleware function
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Always show locale in URL (e.g., /en, /es)
});

/**
 * Main middleware handler
 * 
 * Order of operations:
 * 1. Check for excluded routes (sitemap, robots) FIRST
 * 2. i18n middleware handles locale detection and routing
 * 3. Auth middleware handles route protection
 * 
 * Error handling: Wrapped in try-catch to prevent middleware crashes
 */
export default auth((req) => {
  try {
    const { pathname } = req.nextUrl;

    // CRITICAL: Skip ALL middleware processing for sitemap and robots.txt FIRST
    // These must be served directly at root without any locale or auth processing
    // This check must happen before any other processing
    if (isExcludedRoute(pathname)) {
      return NextResponse.next();
    }

    // NextAuth's auth() wrapper adds the auth property to the request
    const isLoggedIn = !!(req as NextRequest & { auth?: unknown }).auth;

    // First, handle i18n routing (only for non-sitemap/robots routes)
    const intlResponse = intlMiddleware(req);

    // If i18n middleware returns a redirect, use it
    if (intlResponse?.status === HTTP_STATUS.REDIRECT) {
      return intlResponse;
    }

    // Skip auth check for API routes
    if (isApiRoute(pathname)) {
      return intlResponse || NextResponse.next();
    }

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return intlResponse || NextResponse.next();
    }

    // Redirect to sign in if not authenticated
    if (!isLoggedIn) {
      const locale = extractLocale(pathname) || defaultLocale;
      const signInUrl = createSignInUrl(req, locale, pathname);
      return NextResponse.redirect(signInUrl);
    }

    return intlResponse || NextResponse.next();
  } catch (error) {
    // Log error but don't crash the middleware
    // Return a generic response to allow the request to continue
    logger.error(
      "Middleware error",
      error instanceof Error ? error : new Error(String(error)),
      { pathname: req.nextUrl.pathname }
    );

    // In production, return next() to allow request to continue
    // In development, we might want to see the error
    return NextResponse.next();
  }
});

/**
 * Middleware matcher configuration
 * 
 * Excludes routes that don't need middleware processing:
 * - API routes (handled separately)
 * - Static files (_next/static, _next/image)
 * - Metadata files (sitemap.xml, robots.txt, favicon.ico)
 * - Image and asset files (svg, png, jpg, etc.)
 * 
 * Pattern breakdown:
 * - (?!...) = negative lookahead (exclude these patterns)
 * - sitemap\\.xml and robots\\.txt = exact matches for these files
 * - .*\\.(?:xml|txt|...) = any file with these extensions
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:xml|txt|svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
