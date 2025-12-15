/**
 * API Route Error Wrapper
 * 
 * Wraps API route handlers to provide consistent error handling
 * - Catches all errors
 * - Logs to Sentry
 * - Returns user-friendly responses
 */

import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, handleApiError } from "../errors";
import { logger } from "../logger";

type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with error handling
 * 
 * @example
 * export const GET = withErrorHandling(async (request) => {
 *   // Your handler code
 * });
 */
export function withErrorHandling(
  handler: ApiHandler,
  defaultErrorMessage: string = "An error occurred. Please try again."
) {
  return async (
    request: NextRequest,
    context?: any
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, handler.name, defaultErrorMessage);
    }
  };
}

/**
 * Wraps an API route handler with error handling and validation
 */
export function withErrorHandlingAndValidation<T>(
  handler: (request: NextRequest, validatedData: T, context?: any) => Promise<NextResponse>,
  validator: (data: unknown) => T,
  defaultErrorMessage: string = "An error occurred. Please try again."
) {
  return async (
    request: NextRequest,
    context?: any
  ): Promise<NextResponse> => {
    try {
      // Parse and validate request body
      let validatedData: T;
      try {
        const body = await request.json();
        validatedData = validator(body);
      } catch (parseError) {
        logger.error("Failed to parse request body", parseError instanceof Error ? parseError : new Error(String(parseError)));
        return createErrorResponse(
          new Error("Invalid request format"),
          "Invalid request. Please check your input.",
          false
        );
      }

      return await handler(request, validatedData, context);
    } catch (error) {
      return handleApiError(error, handler.name, defaultErrorMessage);
    }
  };
}
