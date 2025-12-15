/**
 * Error utilities for API routes
 * 
 * Provides standardized error handling for API routes
 * - User-friendly error messages
 * - Developer-friendly logging
 * - Consistent error format
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * HTTP Error class for API routes
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public userMessage?: string // User-friendly message
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Create a standardized error response
 * 
 * @param error - The error that occurred
 * @param defaultMessage - User-friendly default message (shown in production)
 * @param logError - Whether to log the error (default: true)
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred. Please try again.",
  logError: boolean = true
): NextResponse {
  // Handle HttpError instances
  if (error instanceof HttpError) {
    // Log error for developers
    if (logError) {
      logger.error(
        `HTTP ${error.statusCode}: ${error.message}`,
        error,
        { code: error.code, statusCode: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: error.userMessage || error.message,
        code: error.code,
        ...(process.env.NODE_ENV === "development" && {
          details: error.message, // Include technical details in dev
        }),
      },
      { status: error.statusCode }
    );
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    // Log error for developers
    if (logError) {
      logger.error(
        `Unhandled error: ${error.message}`,
        error,
        { errorName: error.name, stack: error.stack }
      );
    }

    // Don't leak error details in production
    const userMessage =
      process.env.NODE_ENV === "production"
        ? defaultMessage
        : error.message;

    return NextResponse.json(
      {
        error: userMessage,
        ...(process.env.NODE_ENV === "development" && {
          details: error.message,
          stack: error.stack,
        }),
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  if (logError) {
    logger.error(
      "Unknown error occurred",
      new Error(String(error)),
      { errorType: typeof error }
    );
  }

  return NextResponse.json(
    {
      error: defaultMessage,
    },
    { status: 500 }
  );
}

/**
 * Common HTTP errors with user-friendly messages
 */
export const Errors = {
  Unauthorized: (userMessage?: string) =>
    new HttpError(
      401,
      "Unauthorized access",
      "UNAUTHORIZED",
      userMessage || "Please sign in to continue."
    ),
  Forbidden: (userMessage?: string) =>
    new HttpError(
      403,
      "Access forbidden",
      "FORBIDDEN",
      userMessage || "You don't have permission to perform this action."
    ),
  NotFound: (userMessage?: string) =>
    new HttpError(
      404,
      "Resource not found",
      "NOT_FOUND",
      userMessage || "The requested resource was not found."
    ),
  BadRequest: (userMessage?: string) =>
    new HttpError(
      400,
      "Invalid request",
      "BAD_REQUEST",
      userMessage || "Please check your input and try again."
    ),
  Conflict: (userMessage?: string) =>
    new HttpError(
      409,
      "Resource conflict",
      "CONFLICT",
      userMessage || "This action conflicts with existing data."
    ),
  InternalServerError: (userMessage?: string) =>
    new HttpError(
      500,
      "Internal server error",
      "INTERNAL_SERVER_ERROR",
      userMessage || "An unexpected error occurred. Please try again later."
    ),
  ValidationError: (message: string) =>
    new HttpError(400, `Validation error: ${message}`, "VALIDATION_ERROR", message),
  RateLimitError: () =>
    new HttpError(
      429,
      "Too many requests",
      "RATE_LIMIT_EXCEEDED",
      "Too many requests. Please wait a moment and try again."
    ),
  DatabaseError: (userMessage?: string) =>
    new HttpError(
      500,
      "Database error",
      "DATABASE_ERROR",
      userMessage || "A database error occurred. Please try again."
    ),
};

/**
 * Handle API route errors with proper logging
 * 
 * Wraps API route handlers to catch and handle errors consistently
 */
export async function handleApiError(
  error: unknown,
  context: string,
  defaultMessage: string = "An error occurred. Please try again."
): Promise<NextResponse> {
  // Log with context for developers
  if (error instanceof Error) {
    logger.error(`API Error in ${context}`, error, {
      context,
      errorName: error.name,
    });
  } else {
    logger.error(`Unknown error in ${context}`, new Error(String(error)), {
      context,
    });
  }

  return createErrorResponse(error, defaultMessage, false); // Already logged above
}

