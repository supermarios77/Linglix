/**
 * Error utilities for API routes
 * 
 * Provides standardized error handling for API routes
 */

import { NextResponse } from "next/server";

/**
 * HTTP Error class for API routes
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Don't leak error details in production
    const message =
      process.env.NODE_ENV === "production"
        ? defaultMessage
        : error.message;

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
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
 * Common HTTP errors
 */
export const Errors = {
  Unauthorized: () => new HttpError(401, "Unauthorized", "UNAUTHORIZED"),
  Forbidden: () => new HttpError(403, "Forbidden", "FORBIDDEN"),
  NotFound: () => new HttpError(404, "Not found", "NOT_FOUND"),
  BadRequest: (message: string = "Bad request") =>
    new HttpError(400, message, "BAD_REQUEST"),
  Conflict: (message: string = "Conflict") =>
    new HttpError(409, message, "CONFLICT"),
  InternalServerError: (message: string = "Internal server error") =>
    new HttpError(500, message, "INTERNAL_SERVER_ERROR"),
};

