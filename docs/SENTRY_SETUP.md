# Sentry Setup Guide

Complete guide for setting up and configuring Sentry monitoring for Linglix.

## Overview

Sentry provides:
- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Track slow transactions and API calls
- **Session Replay**: Record user sessions for debugging
- **Release Tracking**: Monitor errors by release version
- **Alerting**: Get notified of critical issues

## Initial Setup

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up
2. Create a new project
3. Select "Next.js" as the platform
4. Copy your DSN (Data Source Name)

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=linglix
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps upload
```

### 3. Verify Installation

1. Deploy your application
2. Trigger a test error (temporarily)
3. Check Sentry dashboard for the error
4. Remove test error

## Configuration Files

### Server Configuration
`config/sentry/server.config.ts` - Server-side error tracking

### Client Configuration
`config/sentry/client.config.ts` - Browser-side error tracking

### Edge Configuration
`config/sentry/edge.config.ts` - Edge runtime error tracking

## Features

### Error Tracking

Errors are automatically captured from:
- API routes
- Server components
- Client components
- Edge functions

### Performance Monitoring

- Tracks API response times
- Monitors slow database queries
- Identifies performance bottlenecks
- Sample rate: 10% in production

### Session Replay

- Records 10% of sessions in production
- Records 100% of sessions with errors
- Masks all text and media for privacy

### Release Tracking

Automatically tracks releases using:
- `VERCEL_GIT_COMMIT_SHA` (Vercel deployments)
- `NEXT_PUBLIC_APP_VERSION` (manual version)

## Alert Setup

See [SENTRY_ALERTS.md](./SENTRY_ALERTS.md) for detailed alert configuration.

### Quick Alert Setup

1. Go to Sentry Dashboard → Alerts → Create Alert Rule
2. Configure alert conditions (error rate, new issues, etc.)
3. Set up notification channels (Email, Slack, PagerDuty)
4. Test alerts

## Using Alert Helpers

### Payment Errors

```typescript
import { capturePaymentError } from "@/lib/monitoring/sentry-alerts";

try {
  // Payment processing
} catch (error) {
  capturePaymentError(error, {
    bookingId: "booking-123",
    userId: "user-123",
    amount: 30.0,
    stripeError: "card_declined",
  });
}
```

### Authentication Errors

```typescript
import { captureAuthError } from "@/lib/monitoring/sentry-alerts";

try {
  // Auth processing
} catch (error) {
  captureAuthError(error, {
    route: "/api/auth/signin",
    attemptCount: 5, // For brute force detection
  });
}
```

### Database Errors

```typescript
import { captureDatabaseError } from "@/lib/monitoring/sentry-alerts";

try {
  // Database operation
} catch (error) {
  captureDatabaseError(error, {
    operation: "create",
    table: "users",
  });
}
```

### Booking Errors

```typescript
import { captureBookingError } from "@/lib/monitoring/sentry-alerts";

try {
  // Booking operation
} catch (error) {
  captureBookingError(error, {
    bookingId: "booking-123",
    userId: "user-123",
    operation: "create",
  });
}
```

## Source Maps

Source maps are automatically uploaded during build for better stack traces.

### Manual Upload (if needed)

```bash
npx @sentry/cli releases files VERSION upload-sourcemaps .next
```

## Monitoring Dashboard

### Key Metrics

1. **Error Rate**: Overall error rate by environment
2. **Affected Users**: Number of users experiencing errors
3. **Performance**: P50, P95, P99 response times
4. **Release Health**: Crash-free sessions and users

### Filters

Use tags to filter errors:
- `route`: API route path
- `alert_category`: Error category (payment, auth, etc.)
- `alert_severity`: Error severity (critical, high, etc.)
- `environment`: Environment (production, staging, etc.)

## Best Practices

### 1. Don't Log Sensitive Data

- Never log passwords, tokens, or PII
- Use `sendDefaultPii: false` (already configured)
- Mask sensitive data in error messages

### 2. Use Appropriate Severity

- **Critical**: Payment failures, security issues
- **High**: Booking errors, authentication failures
- **Medium**: General API errors
- **Low**: Non-critical warnings

### 3. Add Context

- Include relevant tags (route, user_id, etc.)
- Add breadcrumbs for debugging
- Include request context

### 4. Filter Noise

- Ignore browser extension errors
- Filter out known non-actionable errors
- Use alert rules to focus on important issues

## Troubleshooting

### Errors Not Appearing

1. Check `SENTRY_DSN` is set correctly
2. Verify environment is "production"
3. Check Sentry dashboard for rate limits
4. Verify source maps are uploaded

### Too Many Errors

1. Review ignored errors list
2. Add more specific filters
3. Adjust sample rates
4. Review alert thresholds

### Performance Impact

1. Sample rates are already optimized (10% in production)
2. Session replay is limited (10% of sessions)
3. Source maps are uploaded during build (not runtime)

## Production Checklist

- [ ] `SENTRY_DSN` configured in production
- [ ] Source maps uploading correctly
- [ ] Alerts configured and tested
- [ ] Notification channels set up
- [ ] Team members have Sentry access
- [ ] Release tracking working
- [ ] Performance monitoring enabled
- [ ] Session replay configured

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Alert Rules](https://docs.sentry.io/product/alerts/alert-rules/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
