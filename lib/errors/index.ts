/**
 * Error Handling Module
 * 
 * Centralized error handling for the application
 * 
 * Exports:
 * - Server-side error utilities (API routes)
 * - Client-side error utilities (React components)
 * - Error boundaries
 * - Validation helpers
 * - Database error handlers
 */

// Server-side errors
export {
  HttpError,
  createErrorResponse,
  Errors,
  handleApiError,
} from "./errors";

// API wrapper
export { withErrorHandling, withErrorHandlingAndValidation } from "./api-wrapper";

// Client-side errors
export {
  handleClientError,
  formatErrorMessage,
  isRetryableError,
} from "./client";

// Validation errors
export {
  formatValidationError,
  createValidationErrorResponse,
  validateData,
} from "./validation";

// Database errors
export { handleDatabaseError } from "./database";
