import * as Sentry from '@sentry/nextjs';

/**
 * Next.js Instrumentation
 * 
 * This file is automatically called by Next.js to initialize monitoring.
 * It loads the appropriate Sentry configuration based on the runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./config/sentry/server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./config/sentry/edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
