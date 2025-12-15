/**
 * Sentry Alert Helpers
 * 
 * Utilities for enhancing error tracking with alert-friendly context
 * and tags for better alerting in Sentry.
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

/**
 * Alert categories for filtering
 */
export enum AlertCategory {
  PAYMENT = "payment",
  AUTH = "auth",
  DATABASE = "database",
  BOOKING = "booking",
  API = "api",
  PERFORMANCE = "performance",
  SECURITY = "security",
}

/**
 * Capture error with alert context
 * 
 * @param error - Error to capture
 * @param options - Alert options
 */
export function captureErrorWithAlert(
  error: Error | unknown,
  options: {
    severity?: AlertSeverity;
    category?: AlertCategory;
    route?: string;
    userId?: string;
    tags?: Record<string, string>;
    context?: Record<string, any>;
    fingerprint?: string[];
  } = {}
) {
  const {
    severity = AlertSeverity.MEDIUM,
    category,
    route,
    userId,
    tags = {},
    context = {},
    fingerprint,
  } = options;

  // Build tags for alerting
  const alertTags: Record<string, string> = {
    ...tags,
    alert_severity: severity,
  };

  if (category) {
    alertTags.alert_category = category;
  }

  if (route) {
    alertTags.route = route;
  }

  // Set user context if available
  if (userId) {
    Sentry.setUser({ id: userId });
  }

  // Capture exception with context
  Sentry.captureException(error, {
    level: severity === AlertSeverity.CRITICAL ? "fatal" : "error",
    tags: alertTags,
    contexts: {
      alert: {
        severity,
        category,
        route,
        ...context,
      },
    },
    fingerprint: fingerprint || undefined,
  });
}

/**
 * Capture payment error with alert context
 */
export function capturePaymentError(
  error: Error | unknown,
  options: {
    bookingId?: string;
    userId?: string;
    amount?: number;
    stripeError?: string;
  } = {}
) {
  captureErrorWithAlert(error, {
    severity: AlertSeverity.CRITICAL,
    category: AlertCategory.PAYMENT,
    route: "/api/payments",
    userId: options.userId,
    tags: {
      payment: "true",
      booking_id: options.bookingId || "unknown",
      stripe_error: options.stripeError || "unknown",
    },
    context: {
      bookingId: options.bookingId,
      amount: options.amount,
      stripeError: options.stripeError,
    },
    fingerprint: ["payment-error", options.bookingId || "unknown"],
  });
}

/**
 * Capture authentication error with alert context
 */
export function captureAuthError(
  error: Error | unknown,
  options: {
    route?: string;
    email?: string;
    attemptCount?: number;
  } = {}
) {
  // Determine severity based on attempt count (potential brute force)
  const severity =
    (options.attemptCount || 0) > 10
      ? AlertSeverity.CRITICAL
      : AlertSeverity.HIGH;

  captureErrorWithAlert(error, {
    severity,
    category: AlertCategory.AUTH,
    route: options.route || "/api/auth",
    tags: {
      auth: "true",
      auth_route: options.route || "unknown",
      attempt_count: String(options.attemptCount || 0),
    },
    context: {
      email: options.email ? "***" : undefined, // Don't log actual email
      attemptCount: options.attemptCount,
    },
    fingerprint: ["auth-error", options.route || "unknown"],
  });
}

/**
 * Capture database error with alert context
 */
export function captureDatabaseError(
  error: Error | unknown,
  options: {
    query?: string;
    operation?: string;
    table?: string;
  } = {}
) {
  captureErrorWithAlert(error, {
    severity: AlertSeverity.CRITICAL,
    category: AlertCategory.DATABASE,
    tags: {
      error_type: "database",
      database_operation: options.operation || "unknown",
      database_table: options.table || "unknown",
    },
    context: {
      operation: options.operation,
      table: options.table,
      // Don't log full query for security
      query_preview: options.query
        ? options.query.substring(0, 100)
        : undefined,
    },
    fingerprint: ["database-error", options.operation || "unknown"],
  });
}

/**
 * Capture booking error with alert context
 */
export function captureBookingError(
  error: Error | unknown,
  options: {
    bookingId?: string;
    userId?: string;
    tutorId?: string;
    operation?: string;
  } = {}
) {
  captureErrorWithAlert(error, {
    severity: AlertSeverity.HIGH,
    category: AlertCategory.BOOKING,
    route: "/api/bookings",
    userId: options.userId,
    tags: {
      booking: "true",
      booking_id: options.bookingId || "unknown",
      booking_operation: options.operation || "unknown",
    },
    context: {
      bookingId: options.bookingId,
      tutorId: options.tutorId,
      operation: options.operation,
    },
    fingerprint: ["booking-error", options.operation || "unknown"],
  });
}

/**
 * Capture performance issue
 */
export function capturePerformanceIssue(
  message: string,
  options: {
    route?: string;
    duration?: number;
    threshold?: number;
  } = {}
) {
  const { route, duration, threshold } = options;

  Sentry.captureMessage(message, {
    level: duration && threshold && duration > threshold ? "warning" : "info",
    tags: {
      alert_category: AlertCategory.PERFORMANCE,
      route: route || "unknown",
      duration_ms: duration ? String(duration) : undefined,
    },
    contexts: {
      performance: {
        route,
        duration,
        threshold,
      },
    },
  });
}

/**
 * Set release context for better alerting
 */
export function setReleaseContext(version: string, environment: string) {
  Sentry.setContext("release", {
    version,
    environment,
    deployed_at: new Date().toISOString(),
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addAlertBreadcrumb(
  message: string,
  category: string,
  level: "info" | "warning" | "error" = "info",
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}
