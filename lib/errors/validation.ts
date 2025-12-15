/**
 * Validation Error Utilities
 * 
 * Provides user-friendly validation error messages
 */

import { z } from "zod";
import { Errors } from "../errors";

/**
 * Format Zod validation errors into user-friendly messages
 */
export function formatValidationError(error: z.ZodError): string {
  const firstError = error.errors[0];
  if (!firstError) {
    return "Invalid input. Please check your data.";
  }

  const field = firstError.path.join(".");
  const message = firstError.message;

  // Customize messages for common validation errors
  if (message.includes("Required")) {
    return `${field ? `${field}: ` : ""}This field is required.`;
  }

  if (message.includes("Invalid")) {
    return `${field ? `${field}: ` : ""}Invalid value.`;
  }

  if (message.includes("too_small")) {
    return `${field ? `${field}: ` : ""}Value is too small.`;
  }

  if (message.includes("too_big")) {
    return `${field ? `${field}: ` : ""}Value is too large.`;
  }

  if (message.includes("invalid_type")) {
    return `${field ? `${field}: ` : ""}Invalid type.`;
  }

  // Return the original message if no pattern matches
  return message;
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(error: z.ZodError) {
  const userMessage = formatValidationError(error);
  return Errors.BadRequest(userMessage);
}

/**
 * Validate and parse data with user-friendly errors
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: formatValidationError(error),
      };
    }
    return {
      success: false,
      error: "Validation failed. Please check your input.",
    };
  }
}
