"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

/**
 * Global Error Handler
 * 
 * Catches errors that occur in the root layout
 * Provides user-friendly error page with recovery options
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry for developers
    Sentry.captureException(error, {
      tags: {
        errorBoundary: "global-error",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html>
      <body className="antialiased">
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 sm:p-10 border border-[#e5e5e5] dark:border-[#262626] shadow-lg">
              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-3">
                Application Error
              </h1>
              <p className="text-base text-[#666] dark:text-[#a1a1aa] mb-6">
                A critical error occurred. Please refresh the page or return home.
              </p>

              {/* Developer Info (only in development) */}
              {process.env.NODE_ENV === "development" && error.message && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-left">
                  <p className="text-xs font-mono text-red-800 dark:text-red-300 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#111] dark:bg-accent text-white dark:text-black hover:bg-[#222] dark:hover:bg-brand-primary-light rounded-full px-6 py-3 font-semibold transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
                <a
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-accent rounded-full px-6 py-3 font-semibold text-black dark:text-white transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go home
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}