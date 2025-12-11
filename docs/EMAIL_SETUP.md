# Email Notifications Setup

Complete guide for setting up and using the email notification system.

## Overview

Linglix uses **Resend** for sending transactional emails. All emails are:
- ✅ Responsive and work in light/dark mode
- ✅ Non-blocking (won't break user flows if email fails)
- ✅ Properly logged for debugging
- ✅ Localized (English & Spanish)

## Setup

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Add to your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev  # Or your verified domain email
FROM_NAME=Linglix
```

### 2. Verify Your Domain (Production)

For production, you should verify your domain:

1. Add your domain in Resend dashboard
2. Add the required DNS records (SPF, DKIM, DMARC)
3. Update `FROM_EMAIL` to use your domain:
   ```env
   FROM_EMAIL=noreply@linglix.com
   ```

## Available Email Types

### ✅ Implemented

1. **Welcome Email** - Sent after onboarding completion
2. **Tutor Approval Email** - Sent when tutor profile is approved/rejected
3. **Booking Confirmation** - Sent when tutor confirms a booking (to both student and tutor)
4. **Payment Receipt** - Sent after successful payment
5. **Booking Cancellation** - Sent when booking is cancelled (to both student and tutor)
6. **Session Reminders** - Sent 24h and 1h before session (via cron job)

### 🔄 Ready to Use (Not Yet Integrated)

- **Email Verification** - Template ready, needs integration
- **Password Reset** - Template ready, needs integration

## Email Templates

All templates are located in `lib/email/templates.ts` and use a consistent base template with:
- Professional design
- Responsive layout
- Brand colors (#111, #ccf381)
- Clear CTAs

## Integration Points

### Booking Confirmation

**Trigger:** When tutor confirms a booking (status: PENDING → CONFIRMED)

**Location:** `app/api/bookings/[id]/route.ts`

**Recipients:**
- Student (who made the booking)
- Tutor (who confirmed the booking)

**Email includes:**
- Session date & time
- Duration
- Price
- Link to view booking

### Payment Receipt

**Trigger:** After successful Stripe payment (webhook: `checkout.session.completed`)

**Location:** `app/api/payments/webhook/route.ts`

**Recipients:**
- Student (who made the payment)

**Email includes:**
- Booking ID
- Tutor name
- Session date
- Amount paid
- Currency

### Booking Cancellation

**Trigger:** When booking is cancelled (DELETE `/api/bookings/[id]`)

**Location:** `app/api/bookings/[id]/route.ts`

**Recipients:**
- Student
- Tutor

**Email includes:**
- Original session date
- Refund amount (if applicable)
- Cancellation details

### Session Reminders

**Trigger:** Cron job runs every hour

**Location:** `app/api/cron/session-reminders/route.ts`

**Schedule:** Every hour (checks for sessions 24h and 1h away)

**Recipients:**
- Student
- Tutor

**Reminder times:**
- 24 hours before session
- 1 hour before session

**Email includes:**
- Session date & time
- Duration
- Direct link to join session

## Cron Job Setup

### Vercel Cron Jobs

The `vercel.json` file is configured to run session reminders every hour:

```json
{
  "crons": [{
    "path": "/api/cron/session-reminders",
    "schedule": "0 * * * *"
  }]
}
```

Vercel automatically calls this endpoint. No additional setup needed.

### Manual Testing

For testing or other platforms, you can call the endpoint with a secret:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/session-reminders
```

Set `CRON_SECRET` in your `.env` file for authentication.

### Other Platforms

If not using Vercel, set up a cron job to call:
- `GET /api/cron/session-reminders`
- Include header: `Authorization: Bearer YOUR_CRON_SECRET`
- Or set `CRON_SECRET` environment variable

## Usage Examples

### Send Booking Confirmation

```typescript
import { sendBookingConfirmationEmail } from "@/lib/email";
import { getBaseUrl, getBookingUrl } from "@/lib/utils/url";

await sendBookingConfirmationEmail({
  email: "student@example.com",
  name: "John Doe",
  tutorName: "Jane Smith",
  scheduledAt: new Date("2024-01-15T10:00:00Z"),
  duration: 60,
  price: 30.00,
  bookingUrl: getBookingUrl(bookingId, "en"),
  locale: "en",
});
```

### Send Payment Receipt

```typescript
import { sendPaymentReceiptEmail } from "@/lib/email";

await sendPaymentReceiptEmail({
  email: "student@example.com",
  name: "John Doe",
  amount: 30.00,
  currency: "usd",
  bookingId: "booking_123",
  tutorName: "Jane Smith",
  scheduledAt: new Date("2024-01-15T10:00:00Z"),
  locale: "en",
});
```

### Send Session Reminder

```typescript
import { sendSessionReminderEmail } from "@/lib/email";
import { getSessionUrl } from "@/lib/utils/url";

await sendSessionReminderEmail({
  email: "student@example.com",
  name: "John Doe",
  tutorName: "Jane Smith",
  scheduledAt: new Date("2024-01-15T10:00:00Z"),
  duration: 60,
  sessionUrl: getSessionUrl(bookingId, "en"),
  hoursUntil: 24, // or 1
  locale: "en",
});
```

## Error Handling

All email sending is **non-blocking**. If an email fails:

1. Error is logged (console in dev, Sentry in production)
2. User flow continues normally
3. No exception is thrown to the user

Example:

```typescript
sendBookingConfirmationEmail({...}).catch((error) => {
  logger.error("Failed to send email", {
    error: error instanceof Error ? error.message : String(error),
  });
  // User flow continues - booking is still confirmed
});
```

## Localization

All email templates support localization:

- **English (en)** - Default
- **Spanish (es)** - Supported

To add more languages, update the templates in `lib/email/templates.ts` and add translations to `messages/{locale}.json`.

## Testing

### Development

In development, emails are logged but not sent if `RESEND_API_KEY` is not set. Check console for email content.

### Production Testing

1. Use Resend's test mode
2. Check Resend dashboard for email delivery status
3. Monitor error logs for failed sends

## Monitoring

- **Resend Dashboard** - View email delivery status, opens, clicks
- **Application Logs** - All email errors are logged
- **Sentry** - Email errors are tracked in production

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified (for production)
3. Check Resend dashboard for API errors
4. Review application logs for error messages

### Cron Job Not Running

1. Verify `vercel.json` is committed
2. Check Vercel dashboard → Cron Jobs
3. For manual testing, use `CRON_SECRET` header
4. Check logs for cron job execution

### Email Delivery Issues

1. Check spam folder
2. Verify sender email is not blocked
3. Check Resend dashboard for bounce reports
4. Verify DNS records are correct (SPF, DKIM)

## Production Checklist

- [ ] `RESEND_API_KEY` set in production environment
- [ ] Domain verified in Resend dashboard
- [ ] `FROM_EMAIL` uses verified domain
- [ ] `FROM_NAME` set to "Linglix"
- [ ] Cron job configured in Vercel (or alternative)
- [ ] Test emails sent and received
- [ ] Email templates reviewed for branding
- [ ] Error monitoring set up (Sentry)

## Next Steps

- [ ] Integrate email verification flow
- [ ] Integrate password reset flow
- [ ] Add email preferences (opt-out)
- [ ] Add email analytics tracking
- [ ] Create email template preview tool
