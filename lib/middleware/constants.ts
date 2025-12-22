/**
 * Middleware Constants
 * 
 * Centralized constants for middleware configuration
 * Following best practices: extract magic strings and numbers
 */

/**
 * Routes that should be excluded from middleware processing
 */
export const EXCLUDED_ROUTES = {
  SITEMAP: "/sitemap.xml",
  ROBOTS: "/robots.txt",
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = ["/", "/auth", "/tutors", "/onboarding"] as const;

/**
 * Route prefixes that should be excluded from middleware
 */
export const EXCLUDED_PREFIXES = [
  "/api",
  "/_next/static",
  "/_next/image",
  "favicon.ico",
] as const;

/**
 * Static file extensions that should be excluded
 */
export const STATIC_FILE_EXTENSIONS = [
  "xml",
  "txt",
  "svg",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
] as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  REDIRECT: 307,
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

