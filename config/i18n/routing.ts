import { defineRouting } from "next-intl/routing";

/**
 * Routing configuration for next-intl
 * 
 * This configuration is shared between:
 * - proxy.ts (middleware) - for locale detection and redirects
 * - Navigation APIs - for locale-aware navigation
 */
import { locales, defaultLocale } from "./config";

/**
 * Routing configuration for next-intl
 * 
 * This configuration is shared between:
 * - proxy.ts (middleware) - for locale detection and redirects
 * - Navigation APIs - for locale-aware navigation
 */
export const routing = defineRouting({
  // Supported locales - imported from config to keep in sync
  locales: locales as readonly string[],
  
  // Default locale (fallback when no locale matches)
  defaultLocale,
  
  // Locale prefix strategy
  // 'as-needed' - only prefix non-default locale
  // 'always' - always prefix with locale
  localePrefix: "as-needed",
});
