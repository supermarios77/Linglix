# Email Service (Resend)

This directory contains the email service implementation using Resend.

## Setup

1. **Get Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Create an API key in your dashboard
   - Add it to your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev  # Or your verified domain email
FROM_NAME=Linglix
```

2. **Verify Your Domain (Production)**
   - Add your domain in Resend dashboard
   - Add the required DNS records
   - Update `FROM_EMAIL` to use your domain (e.g., `noreply@yourdomain.com`)

## Email Templates

All email templates are responsive and work in both light and dark mode email clients.

### Available Templates

- **Welcome Email** - Sent after onboarding completion
- **Tutor Approval Email** - Sent when tutor profile is approved/rejected
- **Email Verification** - For email verification (ready to use)
- **Password Reset** - For password reset flow (ready to use)

## Usage

```typescript
import { sendWelcomeEmail, sendTutorApprovalEmail } from "@/lib/email";

// Send welcome email
await sendWelcomeEmail({
  email: "user@example.com",
  name: "John Doe",
  role: "STUDENT",
  locale: "en",
});

// Send tutor approval email
await sendTutorApprovalEmail({
  email: "tutor@example.com",
  name: "Jane Smith",
  approved: true,
  locale: "en",
});
```

## Integration Points

- ✅ **Onboarding Completion** - Sends welcome email
- ✅ **Tutor Approval** - Sends approval/rejection email
- ✅ **Booking Confirmation** - Sent when tutor confirms booking (to both student and tutor)
- ✅ **Payment Receipt** - Sent after successful payment
- ✅ **Booking Cancellation** - Sent when booking is cancelled (to both student and tutor)
- ✅ **Session Reminders** - Sent 24h and 1h before session (via cron job)
- 🔄 **Email Verification** - Ready to integrate
- 🔄 **Password Reset** - Ready to integrate

## Error Handling

All email sending is non-blocking. If an email fails to send, it won't break the user flow. Errors are logged to the console (and Sentry in production).

