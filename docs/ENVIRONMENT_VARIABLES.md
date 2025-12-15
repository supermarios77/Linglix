# Environment Variables Reference

Complete reference for all environment variables used in Linglix.

## Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values (see sections below)

3. Validate your configuration:
   ```bash
   bun run validate:env
   ```

## Required Variables

### Core Application

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Node environment | `development`, `production`, `test` | ✅ |
| `NEXTAUTH_URL` | Application URL for NextAuth | `http://localhost:3000` | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` | ✅ |

### Database

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` | ✅ |
| `DIRECT_URL` | Direct DB connection (migrations) | `postgresql://user:pass@host/db` | ✅ |

**Setup:** See [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### Authentication

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXTAUTH_SECRET` | NextAuth secret key | Generate: `openssl rand -base64 32` | ✅ |

**Setup:** See [AUTH_SETUP.md](./AUTH_SETUP.md)

### Payments (Stripe)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` | ✅ |

**Setup:** See [STRIPE_SETUP.md](./STRIPE_SETUP.md)

### Email (Resend)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `RESEND_API_KEY` | Resend API key | `re_...` | ✅ |
| `FROM_EMAIL` | Sender email | `noreply@yourdomain.com` | ⚪ |
| `FROM_NAME` | Sender name | `Linglix` | ⚪ |

**Setup:** See [EMAIL_SETUP.md](./EMAIL_SETUP.md)

### Video & Chat (Stream)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_STREAM_API_KEY` | Stream API key | `...` | ✅ |
| `STREAM_SECRET_KEY` | Stream secret key | `...` | ✅ |

**Setup:** See [STREAM_VIDEO_SETUP.md](./STREAM_VIDEO_SETUP.md)

### Rate Limiting (Upstash)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | `https://...upstash.io` | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | `...` | ✅ |

**Setup:** See [RATE_LIMITING.md](./RATE_LIMITING.md)

## Optional Variables

### Error Tracking (Sentry)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client) | `https://...@sentry.io/...` | ⚪ |
| `SENTRY_DSN` | Sentry DSN (server) | `https://...@sentry.io/...` | ⚪ |
| `SENTRY_ORG` | Sentry organization | `linglix` | ⚪ |
| `SENTRY_PROJECT` | Sentry project | `javascript-nextjs` | ⚪ |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | `...` | ⚪ |

**Setup:** See [SENTRY_SETUP.md](./SENTRY_SETUP.md)

### OAuth Providers

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `...` | ⚪ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `...` | ⚪ |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | `...` | ⚪ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | `...` | ⚪ |

**Setup:** See [AUTH_SETUP.md](./AUTH_SETUP.md)

### File Storage

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | `vercel_blob_rw_...` | ⚪ |

### Cron Jobs

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CRON_SECRET` | Cron authentication secret | Generate: `openssl rand -hex 32` | ⚪ |

**Setup:** See [CRON_SETUP.md](./CRON_SETUP.md)

### Release Tracking

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` | ⚪ |

**Note:** Automatically set by Vercel as `VERCEL_GIT_COMMIT_SHA`

### Development

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SENTRY_DEBUG` | Enable Sentry in dev | `true` or `false` | ⚪ |

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production

```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Validation

Run the validation script to check your configuration:

```bash
bun run validate:env
```

This will:
- ✅ Check all required variables are set
- ✅ Validate variable formats
- ✅ Warn about missing optional variables
- ✅ Provide setup guidance

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Rotate secrets regularly** - Especially in production
4. **Use different values** - Development and production should differ
5. **Limit access** - Only team members who need access
6. **Use secrets management** - Vercel, AWS Secrets Manager, etc.

## Vercel Configuration

For Vercel deployments, add environment variables in:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable for appropriate environments (Production, Preview, Development)
3. Redeploy after adding variables

## Troubleshooting

### Variable Not Working

1. Check variable name (case-sensitive)
2. Restart development server after changes
3. Verify `.env` file is in project root
4. Check for typos or extra spaces
5. Run `bun run validate:env` to check

### Missing Variables

- Check `.env.example` for all available variables
- See specific setup guides in `docs/` directory
- Run validation script for detailed errors

### Production Issues

- Verify all required variables are set in Vercel
- Check environment-specific values (production vs development)
- Ensure secrets are strong and unique
- Review security guidelines in `SECURITY.md`

## Quick Reference

### Generate Secrets

```bash
# NextAuth Secret
openssl rand -base64 32

# Cron Secret
openssl rand -hex 32
```

### Test Configuration

```bash
# Validate environment
bun run validate:env

# Test database connection
bun run db:studio

# Test email (check logs)
# Register a new user

# Test Stripe (use test mode)
# Create a test booking and checkout
```

## Related Documentation

- [Database Setup](./DATABASE_SETUP.md)
- [Authentication Setup](./AUTH_SETUP.md)
- [Stripe Setup](./STRIPE_SETUP.md)
- [Email Setup](./EMAIL_SETUP.md)
- [Stream Video Setup](./STREAM_VIDEO_SETUP.md)
- [Rate Limiting Setup](./RATE_LIMITING.md)
- [Sentry Setup](./SENTRY_SETUP.md)
- [Cron Setup](./CRON_SETUP.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)
