# Security Guidelines

## Environment Variables

All sensitive data must be stored in environment variables, never in code.

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Linglix

# Optional
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SENTRY_DSN=...

# 100ms Video Calling
HMS100_APP_ID=your-100ms-app-id
HMS100_APP_SECRET=your-100ms-app-secret
HMS100_ROOM_ID=optional-room-id (leave empty to auto-generate)

```

## Security Best Practices

### ✅ Implemented

- [x] Environment variables for all secrets
- [x] Input validation with Zod on all API routes
- [x] SQL injection prevention (Prisma)
- [x] XSS prevention (React escaping)
- [x] CSRF protection (NextAuth)
- [x] Password hashing with bcrypt
- [x] JWT session strategy
- [x] Role-based access control
- [x] Error messages don't leak sensitive data
- [x] Production logging (Sentry integration)
- [x] Secure password requirements (min 8 chars)

### 🔄 To Implement

- [ ] Rate limiting on API routes
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Two-factor authentication (optional)
- [ ] API rate limiting per user
- [ ] Content Security Policy headers
- [ ] Security headers middleware

## Code Security

### No Hardcoded Secrets

✅ All API keys, secrets, and passwords are in environment variables

### Error Handling

✅ Errors don't leak sensitive information:
- Database errors return generic messages
- Authentication errors don't reveal if user exists
- Stack traces only in development

### Input Validation

✅ All API routes validate input with Zod:
- Type checking
- Format validation
- Length limits
- Sanitization

### Authentication

✅ Secure authentication:
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Session management
- Role-based access control

## Reporting Security Issues

If you discover a security vulnerability, please email security@linglix.com instead of using the issue tracker.

