/**
 * Sentry Client Configuration
 * 
 * This file configures Sentry for client-side error tracking and performance monitoring.
 * It runs in the browser whenever a user loads a page.
 * 
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined, // Only init if DSN is provided

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content and user input
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Adjust traces sample rate in production
  // 1.0 = 100% of transactions, 0.1 = 10% of transactions
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Replay session sample rate
  // 10% of sessions will be recorded in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Replay error sample rate
  // 100% of sessions with errors will be recorded
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // Only enable if you're comfortable with sending user data
  sendDefaultPii: false, // Security: disabled by default

  // Filter out browser extension errors and other noise
  ignoreErrors: [
    // Browser extensions
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    "ChunkLoadError",
    // Network errors that are not actionable
    "NetworkError",
    "Failed to fetch",
    // Ad blockers
    "Blocked a frame with origin",
  ],

  // Filter out transactions from health checks and monitoring
  beforeSend(event) {
    // Don't send events in development unless explicitly testing
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;