/**
 * Production-ready logging utility
 * 
 * - Development: Logs to console
 * - Production: Logs to Sentry (errors only)
 * - No sensitive data in logs
 */

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Logger class for production-ready logging
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || "");
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || "");
    }
  }

  /**
   * Log error message
   * In production, also sends to Sentry
   */
  async error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || "");
    }

    if (this.isProduction && error) {
      try {
        const { captureException } = await import("@sentry/nextjs");
        // Convert context to Sentry-compatible format
        const sentryTags = context
          ? Object.fromEntries(
              Object.entries(context).filter(
                ([, v]) =>
                  typeof v === "string" ||
                  typeof v === "number" ||
                  typeof v === "boolean"
              )
            )
          : undefined;
        captureException(error, {
          tags: sentryTags,
          extra: { message },
        });
      } catch {
        // Sentry not available, fail silently
      }
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  }
}

export const logger = new Logger();

