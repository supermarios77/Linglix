import createMiddleware from "next-intl/middleware";
import { routing } from "@/config/i18n/routing";

/**
 * Next.js 16 Proxy (Middleware)
 * 
 * This file replaces middleware.ts in Next.js 16.
 * It handles:
 * - Locale detection and negotiation
 * - Locale-based routing (redirects and rewrites)
 * - Alternate links for SEO
 * 
 * Important: Authentication should NOT be done here.
 * Use Server Layout Guards in layout.tsx files instead.
 * 
 * @see https://next-intl.dev/docs/routing/middleware
 */
const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

/**
 * Matcher configuration
 * 
 * Excludes:
 * - API routes (/api/*)
 * - Internal Next.js routes (_next/*, _vercel/*)
 * - Static files (.*\\..*)
 * - Favicon and other root files
 */
export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - Files with an extension (e.g. .ico, .png, .jpg)
    // - Files in the public folder
    "/((?!api|_next|_vercel|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
