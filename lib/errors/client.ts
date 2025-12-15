/**
 * Client-side Error Handling Utilities
 * 
 * Provides error handling for client components
 * - User-friendly error messages
 * - Error logging to Sentry
 * - Toast notifications
 */

"use client";

import * as Sentry from "@sentry/nextjs";

/**
 * Client-side error handler
 * 
 * Logs errors to Sentry and returns user-friendly message
 */
export function handleClientError(
  error: unknown,
  context?: string
): { message: string; shouldRetry: boolean } {
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  // Log to Sentry in production
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      tags: {
        errorSource: "client",
        context: context || "unknown",
      },
    });
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.error(`[Client Error]${context ? ` [${context}]` : ""}:`, error);
  }

  // Determine user-friendly message and retry suggestion
  let userMessage: string;
  let shouldRetry = false;

  if (error instanceof Error) {
    // Network errors - suggest retry
    if (
      errorMessage.includes("fetch") ||
      errorMessage.includes("network") ||
      errorMessage.includes("Failed to fetch")
    ) {
      userMessage = "Network error. Please check your connection and try again.";
      shouldRetry = true;
    }
    // Validation errors - don't retry
    else if (errorMessage.includes("validation") || errorMessage.includes("invalid")) {
      userMessage = errorMessage;
      shouldRetry = false;
    }
    // Generic errors
    else {
      userMessage =
        process.env.NODE_ENV === "development"
          ? errorMessage
          : "Something went wrong. Please try again.";
      shouldRetry = true;
    }
  } else {
    userMessage = "An unexpected error occurred. Please try again.";
    shouldRetry = true;
  }

  return { message: userMessage, shouldRetry };
}

/**
 * Format error message for display to users
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't show technical errors to users in production
    if (process.env.NODE_ENV === "production") {
      // Map common errors to user-friendly messages
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return "Network error. Please check your connection.";
      }
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        return "Please sign in to continue.";
      }
      if (error.message.includes("403") || error.message.includes("Forbidden")) {
        return "You don't have permission to perform this action.";
      }
      if (error.message.includes("404") || error.message.includes("Not found")) {
        return "The requested resource was not found.";
      }
      return "Something went wrong. Please try again.";
    }
    // Show actual error in development
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("timeout") ||
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504")
    );
  }
  return false;
}
