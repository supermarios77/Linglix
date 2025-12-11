# Stripe Payment Integration Setup

Complete guide for setting up Stripe payments in Linglix with production-ready configuration.

## Overview

Linglix uses Stripe Checkout Sessions for secure payment processing. Payments are triggered when:
1. Tutor confirms a booking (status changes to `CONFIRMED`)
2. Student clicks "Pay Now" button on their dashboard
3. Student is redirected to Stripe-hosted checkout page
4. Payment is processed securely by Stripe
5. Webhook updates booking with payment confirmation

## Environment Variables

### Required Variables

Add these to your `.env.local` (development) or Vercel environment variables (production):

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...                    # Test mode: sk_test_... | Live: sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Test mode: pk_test_... | Live: pk_live_...

# Stripe Webhook Secret (get from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URL (for redirects)
NEXT_PUBLIC_APP_URL=https://yourdomain.com       # Production URL
```

### Getting Stripe API Keys

1. **Sign up for Stripe**: Go to [https://stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:
   - Navigate to **Developers → API keys**
   - Copy your **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy your **Secret key** → `STRIPE_SECRET_KEY`
   - **Important**: Use test keys (`sk_test_`, `pk_test_`) for development

3. **Get Webhook Secret**:
   - Navigate to **Developers → Webhooks**
   - Click **Add endpoint** or select existing endpoint
   - Set endpoint URL: `https://yourdomain.com/api/payments/webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

## Database Schema

The `Booking` model includes payment-related fields:

```prisma
model Booking {
  // ... other fields
  paymentId   String? // Stripe Checkout Session ID
  price       Float   // Booking price in USD
  status      BookingStatus @default(PENDING)
  // ...
}
```

No additional migrations needed - payment fields are already in the schema.

## Payment Flow

### 1. Booking Confirmation
- Tutor confirms booking → Status changes to `CONFIRMED`
- Student sees "Pay Now" button on dashboard

### 2. Checkout Session Creation
- Student clicks "Pay Now"
- POST `/api/payments/checkout` creates Stripe Checkout Session
- Session includes:
  - Booking details in metadata
  - Customer email
  - Success/cancel URLs
  - Expiration time (before session start)

### 3. Payment Processing
- Student redirected to Stripe-hosted checkout
- Payment processed securely by Stripe
- No sensitive payment data touches our servers (PCI compliant)

### 4. Webhook Processing
- Stripe sends webhook to `/api/payments/webhook`
- Webhook signature verified for security
- Booking updated with `paymentId`
- Idempotency prevents duplicate processing

### 5. Success/Cancel Pages
- Success: `/payments/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel: `/payments/cancel?booking_id={bookingId}`

## Security Features

### ✅ Implemented

- **Webhook Signature Verification**: All webhooks verified using `STRIPE_WEBHOOK_SECRET`
- **Server-Side Only**: Secret keys never exposed to client
- **Idempotency**: Duplicate webhook events are safely ignored
- **Authentication**: All payment endpoints require authentication
- **Authorization**: Students can only pay for their own bookings
- **Status Validation**: Only `CONFIRMED` bookings can be paid
- **Duplicate Payment Prevention**: Checks for existing payments before creating new session

### Security Best Practices

1. **Never expose secret keys**: Only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is public
2. **Always verify webhooks**: Signature verification prevents spoofed events
3. **Validate booking ownership**: Students can only pay for their bookings
4. **Check payment status**: Only process `paid` checkout sessions
5. **Idempotent operations**: Webhook handlers can be safely retried

## Error Handling

### Checkout Errors

- **Stripe not configured**: Returns 500 with clear error message
- **Booking not found**: Returns 404
- **Unauthorized access**: Returns 403
- **Invalid booking status**: Returns 400
- **Already paid**: Returns 400 with message

### Webhook Errors

- **Invalid signature**: Returns 400, Stripe will retry
- **Missing metadata**: Logs error, skips processing
- **Booking not found**: Logs error, returns 200 (prevents retry)
- **Processing error**: Returns 500, Stripe will retry with backoff

## Testing

### Test Mode Setup

1. Use test API keys (`sk_test_`, `pk_test_`)
2. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
3. Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### Testing Checklist

- [ ] Create a test booking (status: `CONFIRMED`)
- [ ] Click "Pay Now" button
- [ ] Complete payment with test card
- [ ] Verify webhook received and booking updated
- [ ] Check success page displays correctly
- [ ] Test cancel flow
- [ ] Test duplicate payment prevention
- [ ] Test webhook idempotency (send same event twice)

## Production Deployment

### Pre-Deployment Checklist

- [ ] Switch to live API keys (`sk_live_`, `pk_live_`)
- [ ] Create production webhook endpoint in Stripe Dashboard
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Set `STRIPE_WEBHOOK_SECRET` from production webhook
- [ ] Test webhook endpoint is accessible
- [ ] Verify webhook signature verification works
- [ ] Test complete payment flow in production mode

### Vercel Configuration

1. **Add Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all Stripe-related variables
   - Set for **Production**, **Preview**, and **Development** environments

2. **Webhook Endpoint**:
   - Production URL: `https://yourdomain.com/api/payments/webhook`
   - Add this URL in Stripe Dashboard → Webhooks
   - Copy the webhook signing secret to Vercel environment variables

3. **Verify Deployment**:
   - Check webhook endpoint is accessible
   - Test webhook delivery in Stripe Dashboard
   - Monitor webhook logs in Stripe Dashboard

## Monitoring

### Stripe Dashboard

- **Payments**: Monitor successful/failed payments
- **Webhooks**: View webhook delivery status and logs
- **Events**: See all Stripe events in real-time
- **Logs**: Debug webhook processing issues

### Application Logs

All payment-related events are logged:
- Checkout session creation
- Webhook events received
- Payment confirmations
- Errors and failures

Use your logging service (Sentry, etc.) to monitor payment flows.

## Troubleshooting

### Payment Button Not Working

1. Check `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set
2. Verify API keys match (test/test or live/live)
3. Check browser console for errors
4. Verify user is authenticated

### Webhooks Not Received

1. Verify webhook URL is correct in Stripe Dashboard
2. Check webhook endpoint is publicly accessible
3. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
4. Check Vercel logs for webhook requests
5. Use Stripe Dashboard → Webhooks → Recent deliveries to debug

### Duplicate Payments

- Idempotency is built-in, but if issues occur:
  1. Check booking `paymentId` field
  2. Verify webhook events are not being processed twice
  3. Review webhook logs in Stripe Dashboard

### Payment Status Not Updating

1. Check webhook is being received (Stripe Dashboard)
2. Verify webhook signature verification passes
3. Check application logs for webhook processing errors
4. Verify booking exists and status is `CONFIRMED`

## API Reference

### POST `/api/payments/checkout`

Creates a Stripe Checkout Session for a booking.

**Request:**
```json
{
  "bookingId": "clx..."
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/payments/webhook`

Handles Stripe webhook events. Called by Stripe, not directly by your application.

**Headers:**
- `stripe-signature`: Webhook signature for verification

**Events Handled:**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application issues:
- Check application logs
- Review webhook delivery logs in Stripe Dashboard
- Verify environment variables are set correctly

---

*Last updated: After production setup completion*
