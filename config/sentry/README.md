# Sentry Configuration

This directory contains all Sentry configuration files for error tracking and performance monitoring.

## Files

- **`client.config.ts`** - Client-side (browser) Sentry configuration
- **`server.config.ts`** - Server-side (Node.js) Sentry configuration  
- **`edge.config.ts`** - Edge Runtime (middleware, edge routes) Sentry configuration

## Environment Variables

Add these to your `.env` file:

```bash
# Sentry DSN (Data Source Name)
# Get this from your Sentry project settings
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional: Enable Sentry in development (default: disabled)
SENTRY_DEBUG=false
```

## Configuration

All configurations are production-ready with:
- ✅ Environment-based sample rates (10% in production, 100% in development)
- ✅ PII (Personally Identifiable Information) disabled by default
- ✅ Error filtering (browser extensions, network errors, etc.)
- ✅ Development mode disabled by default (set `SENTRY_DEBUG=true` to enable)

## Usage

Sentry is automatically initialized via `instrumentation.ts` in the project root. No manual setup required.

## Error Tracking

To manually capture errors:

```typescript
import * as Sentry from "@sentry/nextjs";

// Capture an exception
Sentry.captureException(error, {
  tags: { component: "MyComponent" },
  extra: { userId: user.id },
});

// Capture a message
Sentry.captureMessage("Something went wrong", "error");
```

## Documentation

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Configuration Options](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/)

