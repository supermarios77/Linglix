/**
 * Sentry Server Configuration
 * 
 * This file configures Sentry for server-side error tracking and performance monitoring.
 * It runs in the Node.js runtime (API routes, Server Components, etc.)
 * 
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

  // Adjust traces sample rate in production
  // 1.0 = 100% of transactions, 0.1 = 10% of transactions
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Enable sending user PII (Personally Identifiable Information)
  // Only enable if you're comfortable with sending user data
  sendDefaultPii: false, // Security: disabled by default

  // Filter out health check and monitoring endpoints
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    // Network errors that are not actionable
    "NetworkError",
    "Failed to fetch",
  ],

  // Filter out transactions from health checks
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly testing
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      return null;
    }
    return event;
  },
});
