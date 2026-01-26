/**
 * Next.js Instrumentation Hook
 * 
 * This file is automatically executed by Next.js when the server starts.
 * Used for initializing monitoring and observability tools like Sentry.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry server-side instrumentation
    // Sentry is already configured via withSentryConfig in next.config.ts
