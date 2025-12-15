/**
 * Database Error Utilities
 * 
 * Handles Prisma and database-specific errors
 * Provides user-friendly error messages
 */

import { Prisma } from "@prisma/client";
import { Errors } from "../errors";
import { HttpError } from "../errors";

/**
 * Handle Prisma errors and convert to user-friendly messages
 */
export function handleDatabaseError(error: unknown): HttpError {
  // Prisma unique constraint violation
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.[0] || "field";
        return Errors.Conflict(
          `This ${field} is already taken. Please use a different value.`
        );

      case "P2025":
        // Record not found
        return Errors.NotFound("The requested record was not found.");

      case "P2003":
        // Foreign key constraint violation
        return Errors.BadRequest(
          "Cannot perform this action due to related data constraints."
        );

      case "P2014":
        // Required relation violation
        return Errors.BadRequest("Required relationship is missing.");

      case "P2000":
        // Value too long
        return Errors.BadRequest("The provided value is too long.");

      case "P2001":
        // Record not found (deprecated, use P2025)
        return Errors.NotFound("The requested record was not found.");

      default:
        // Unknown Prisma error
        return Errors.DatabaseError(
          "A database error occurred. Please try again."
        );
    }
  }

  // Prisma validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return Errors.ValidationError(
      "Invalid data provided. Please check your input."
    );
  }

  // Generic database error
  if (error instanceof Error) {
    // Check for connection errors
    if (
      error.message.includes("connection") ||
      error.message.includes("timeout") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return Errors.DatabaseError(
        "Database connection error. Please try again in a moment."
      );
    }
  }

  // Fallback
  return Errors.DatabaseError();
}
