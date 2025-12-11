/**
 * URL Utilities
 * 
 * Helper functions for generating application URLs
 */

/**
 * Get the base URL of the application
 * 
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL
 * 2. NEXTAUTH_URL
 * 3. Request origin (if provided)
 * 4. Production fallback: https://linglix.com
 * 5. Development fallback: http://localhost:3000
 */
export function getBaseUrl(requestOrigin?: string | null): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (requestOrigin) {
    return requestOrigin;
  }
  
  if (process.env.NODE_ENV === "production") {
    return "https://linglix.com";
  }
  
  return "http://localhost:3000";
}

/**
 * Generate a booking URL
 */
export function getBookingUrl(bookingId: string, locale: string = "en", baseUrl?: string): string {
  const base = baseUrl || getBaseUrl();
  return `${base}/${locale}/dashboard`;
}

/**
 * Generate a session URL
 */
export function getSessionUrl(bookingId: string, locale: string = "en", baseUrl?: string): string {
  const base = baseUrl || getBaseUrl();
  return `${base}/${locale}/sessions/${bookingId}`;
}
