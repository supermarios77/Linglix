/**
 * useErrorHandler Hook
 * 
 * Provides consistent error handling for client components
 * - Formats errors for user display
 * - Logs to Sentry
 * - Provides retry functionality
 */

"use client";

import { useState, useCallback } from "react";
import { handleClientError, formatErrorMessage, isRetryableError } from "../errors/client";

interface UseErrorHandlerOptions {
  onError?: (error: Error) => void;
  context?: string;
}

interface ErrorState {
  error: string | null;
  isRetryable: boolean;
}

/**
 * Hook for handling errors in client components
 * 
 * @example
 * const { error, handleError, clearError, retry } = useErrorHandler();
 * 
 * try {
 *   await someAsyncOperation();
 * } catch (err) {
 *   handleError(err);
 * }
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetryable: false,
  });

  const handleError = useCallback(
    (error: unknown) => {
      const { message, shouldRetry } = handleClientError(error, options.context);
      
      setErrorState({
        error: message,
        isRetryable: shouldRetry || isRetryableError(error),
      });

      // Call custom error handler if provided
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
    },
    [options.context, options.onError]
  );

  const clearError = useCallback(() => {
    setErrorState({ error: null, isRetryable: false });
  }, []);

  const formatError = useCallback((error: unknown): string => {
    return formatErrorMessage(error);
  }, []);

  return {
    error: errorState.error,
    isRetryable: errorState.isRetryable,
    handleError,
    clearError,
    formatError,
  };
}
