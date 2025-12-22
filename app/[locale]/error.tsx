"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

/**
 * Error Page Component
 * 
 * User-friendly error page that:
 * - Shows helpful message to users
 * - Logs detailed error to Sentry for developers
 * - Provides recovery actions
 */
export default function Error({
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
        errorBoundary: "error-page",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
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
            Something went wrong
          </h1>
          <p className="text-base text-[#666] dark:text-[#a1a1aa] mb-6">
            Were sorry, but something unexpected happened. Our team has been notified and is working on a fix.
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
            <Button
              onClick={reset}
              className="flex-1 bg-[#111] dark:bg-accent text-white dark:text-black hover:bg-[#222] dark:hover:bg-brand-primary-light"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-accent"
              >
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-[#888] dark:text-[#666] mt-6">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
