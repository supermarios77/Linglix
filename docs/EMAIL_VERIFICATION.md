# Email Verification Setup

Complete guide for the email verification system in Linglix.

## Overview

Email verification ensures that users have access to the email address they registered with. This helps:
- Prevent fake accounts
- Ensure important notifications reach users
- Improve platform security

## How It Works

### Registration Flow

1. User registers with email/password
2. System creates user account (email not verified initially)
3. Verification email is automatically sent
4. User clicks link in email
5. Email is verified and user can fully use the platform

### OAuth Flow

- OAuth users (Google, etc.) have their email **automatically verified** on first sign-in
- This is because OAuth providers verify emails before allowing sign-in

### Token System

- Verification tokens expire after **24 hours**
- Tokens are **one-time use** (deleted after verification)
- Tokens are stored in the `VerificationToken` table (NextAuth model)

## API Routes

### Verify Email

**POST** `/api/auth/verify-email`

Verifies an email address using a token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "verification-token-from-email"
}
```

**Response (Success):**
```json
{
  "message": "Email has been verified successfully.",
  "verified": true
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired verification token. Please request a new verification email.",
  "code": "BAD_REQUEST"
}
```

### Resend Verification Email

**POST** `/api/auth/resend-verification`

Resends a verification email. Can be called:
- By authenticated users (uses their email)
- By unauthenticated users (requires email in body)

**Request Body (optional):**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists and is not verified, we've sent a verification email."
}
```

**Rate Limited:** 5 requests per 15 minutes

## User Interface

### Verification Page

**Route:** `/auth/verify-email?token={token}&email={email}`

The verification page:
- Automatically verifies email when accessed with valid token
- Shows success/error status
- Allows resending verification email
- Redirects to dashboard after successful verification

### Integration Points

1. **Registration** - Automatically sends verification email
2. **Sign In** - Users can sign in even if email not verified (but may see warnings)
3. **Profile** - Users can resend verification email from their profile

## Database Schema

The `User` model includes:
```prisma
emailVerified DateTime? // Set when email is verified
```

## Configuration

### Token Expiry

Default: **24 hours**

To change, edit `lib/auth/email-verification.ts`:
```typescript
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24; // Change as needed
```

### Email Template

The verification email template is in `lib/email/templates.ts`:
- `emailVerificationTemplate()` - HTML email template
- Responsive design
- Works in light/dark mode email clients

## Security Considerations

1. **Rate Limiting**: Verification routes are rate limited (5 requests per 15 minutes)
2. **Token Security**: Tokens are cryptographically random (32 bytes)
3. **One-Time Use**: Tokens are deleted after use
4. **Expiry**: Tokens expire after 24 hours
5. **Email Enumeration**: Resend endpoint doesn't reveal if email exists

## Testing

### Manual Testing

1. Register a new user
2. Check email inbox for verification email
3. Click verification link
4. Verify email is marked as verified in database
5. Test resend functionality
6. Test expired token handling

### OAuth Testing

1. Sign in with Google OAuth
2. Verify email is automatically marked as verified
3. Check database to confirm `emailVerified` is set

## Troubleshooting

### Verification Email Not Received

1. Check spam/junk folder
2. Verify email service (Resend) is configured
3. Check email logs in Resend dashboard
4. Verify `FROM_EMAIL` is set correctly
5. Check application logs for errors

### Token Expired

- Tokens expire after 24 hours
- User can request a new verification email
- Use the resend verification endpoint

### OAuth Users Not Verified

- OAuth users should be auto-verified on first sign-in
- Check `signIn` callback in `config/auth.config.ts`
- Verify Prisma adapter is working correctly

## Future Enhancements

- [ ] Require email verification before certain actions (e.g., booking)
- [ ] Email verification reminder emails
- [ ] Admin panel to manually verify emails
- [ ] Bulk verification for existing users
- [ ] Verification status in user profile UI
