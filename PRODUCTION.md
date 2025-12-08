# Production Deployment Guide

## Pre-Deployment Checklist

### Environment Variables

Ensure all required environment variables are set:

```env
# Required
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here
NODE_ENV=production

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Linglix

# Optional
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SENTRY_DSN=...
```

### Security

- [x] All secrets in environment variables
- [x] Security headers configured
- [x] Input validation on all API routes
- [x] Error messages don't leak sensitive data
- [x] Production logging (Sentry)
- [x] Password hashing (bcrypt)
- [x] CSRF protection (NextAuth)

### Database

- [x] Run migrations: `bun run db:migrate`
- [x] Verify indexes are created
- [x] Test connection pooling

### Build

```bash
# Generate Prisma client
bun run db:generate

# Build application
bun run build

# Test production build locally
bun run start
```

### Performance

- [x] Image optimization enabled
- [x] Compression enabled
- [x] React strict mode
- [x] Proper caching headers

### Monitoring

- [x] Sentry error tracking configured
- [x] Production logging
- [x] Email notifications for critical errors

## Deployment Steps

1. **Set Environment Variables**
   - Add all required env vars to your hosting platform
   - Verify `NODE_ENV=production`

2. **Database Migration**
   ```bash
   bun run db:migrate
   ```

3. **Build Application**
   ```bash
   bun run build
   ```

4. **Deploy**
   - Push to production branch
   - Platform will auto-deploy

5. **Verify**
   - Check application is running
   - Test authentication flow
   - Verify email sending
   - Check error tracking

## Post-Deployment

- Monitor Sentry for errors
- Check email delivery
- Verify database performance
- Monitor API response times

