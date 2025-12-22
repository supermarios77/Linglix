/**
 * Middleware Utility Functions
 * 
 * Helper functions for middleware logic
 * Following best practices: modular, reusable, testable
 */

import { NextRequest } from "next/server";
import { EXCLUDED_ROUTES, PUBLIC_ROUTES } from "./constants";

/**
 * Check if a route should be excluded from middleware processing
 */
export function isExcludedRoute(pathname: string): boolean {
  return (
    pathname === EXCLUDED_ROUTES.SITEMAP ||
    pathname === EXCLUDED_ROUTES.ROBOTS
  );
}

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  // Remove locale prefix if present
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
  
  return PUBLIC_ROUTES.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(`${route}/`)
  );
}

/**
 * Extract locale from pathname
 * Returns the locale code or null if not found
 */
export function extractLocale(pathname: string): string | null {
  const localeMatch = pathname.match(/^\/([a-z]{2}(-[A-Z]{2})?)/);
  return localeMatch ? localeMatch[1] : null;
}

/**
 * Remove locale prefix from pathname
 */
export function removeLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";
}

/**
 * Check if pathname is an API route
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Check if pathname is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
  const pathnameWithoutLocale = removeLocalePrefix(pathname);
  return pathnameWithoutLocale.startsWith("/admin");
}

/**
 * Create sign-in URL with callback
 */
export function createSignInUrl(
  req: NextRequest,
  locale: string,
  callbackPath?: string
): URL {
  const signInUrl = new URL(`/${locale}/auth/signin`, req.url);
  if (callbackPath) {
    signInUrl.searchParams.set("callbackUrl", callbackPath);
  }
  return signInUrl;
}

