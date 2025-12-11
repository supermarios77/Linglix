# Stripe Production Deployment Checklist

Complete checklist for deploying Stripe payments to production.

## Pre-Deployment

### Environment Variables

- [ ] **STRIPE_SECRET_KEY**: Set to live key (`sk_live_...`)
  - Get from: Stripe Dashboard → Developers → API keys → Secret key
  - ⚠️ Never commit to version control
  - ✅ Add to Vercel environment variables

- [ ] **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Set to live key (`pk_live_...`)
  - Get from: Stripe Dashboard → Developers → API keys → Publishable key
  - ✅ Safe to expose (used in client-side code)
  - ✅ Add to Vercel environment variables

- [ ] **STRIPE_WEBHOOK_SECRET**: Set to production webhook secret (`whsec_...`)
  - Get from: Stripe Dashboard → Developers → Webhooks → [Your endpoint] → Signing secret
  - ⚠️ Must match the webhook endpoint you create
  - ✅ Add to Vercel environment variables

- [ ] **NEXT_PUBLIC_APP_URL**: Set to production domain
  - Example: `https://linglix.com`
  - Used for payment redirect URLs
  - ✅ Add to Vercel environment variables

### Stripe Dashboard Configuration

- [ ] **Create Production Webhook Endpoint**
  - URL: `https://yourdomain.com/api/payments/webhook`
  - Events to listen for:
    - ✅ `checkout.session.completed`
    - ✅ `checkout.session.async_payment_succeeded`
    - ✅ `checkout.session.async_payment_failed`
  - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

- [ ] **Verify API Keys**
  - Confirm using **Live mode** keys (not test mode)
  - Test keys start with `sk_test_` / `pk_test_`
  - Live keys start with `sk_live_` / `pk_live_`

- [ ] **Enable Required Features**
  - ✅ Checkout Sessions enabled
  - ✅ Payment methods configured (cards, etc.)
  - ✅ Business information completed

## Code Verification

### Security Checks

- [ ] **Webhook Signature Verification**
  - ✅ Implemented in `/api/payments/webhook`
  - ✅ Uses `STRIPE_WEBHOOK_SECRET`
  - ✅ Returns 400 on invalid signature

- [ ] **Authentication & Authorization**
  - ✅ Checkout endpoint requires authentication
  - ✅ Students can only pay for their own bookings
  - ✅ Only `CONFIRMED` bookings can be paid

- [ ] **Idempotency**
  - ✅ Webhook handlers are idempotent
  - ✅ Duplicate events are safely ignored
  - ✅ Payment status checked before updates

- [ ] **Error Handling**
  - ✅ All errors logged appropriately
  - ✅ User-friendly error messages
  - ✅ No sensitive data in error responses

### Functionality Checks

- [ ] **Checkout Session Creation**
  - ✅ Validates booking exists
  - ✅ Validates booking ownership
  - ✅ Validates booking status
  - ✅ Prevents duplicate payments
  - ✅ Sets correct metadata
  - ✅ Sets correct redirect URLs

- [ ] **Webhook Processing**
  - ✅ Verifies webhook signature
  - ✅ Handles all required events
  - ✅ Updates booking correctly
  - ✅ Logs all events
  - ✅ Handles errors gracefully

- [ ] **Payment Pages**
  - ✅ Success page displays correctly
  - ✅ Cancel page displays correctly
  - ✅ Both require authentication
  - ✅ Proper error handling

## Testing in Production

### Test Payment Flow

1. [ ] Create a test booking (status: `CONFIRMED`)
2. [ ] Click "Pay Now" button
3. [ ] Complete payment with real card (small amount)
4. [ ] Verify webhook received in Stripe Dashboard
5. [ ] Verify booking updated in database
6. [ ] Check success page displays
7. [ ] Verify payment appears in Stripe Dashboard

### Webhook Testing

1. [ ] Send test webhook from Stripe Dashboard
2. [ ] Verify webhook received and processed
3. [ ] Check application logs for processing
4. [ ] Verify idempotency (send same event twice)
5. [ ] Test error scenarios (invalid signature, etc.)

### Error Scenarios

- [ ] Test with invalid booking ID
- [ ] Test with unauthorized user
- [ ] Test with already-paid booking
- [ ] Test webhook with invalid signature
- [ ] Test webhook with missing metadata

## Monitoring Setup

### Stripe Dashboard

- [ ] **Webhook Monitoring**
  - Monitor webhook delivery success rate
  - Set up alerts for failed webhooks
  - Review webhook logs regularly

- [ ] **Payment Monitoring**
  - Monitor payment success/failure rates
  - Set up alerts for payment issues
  - Review payment logs

### Application Monitoring

- [ ] **Error Tracking**
  - Stripe errors logged to Sentry (or your error tracker)
  - Set up alerts for payment failures
  - Monitor webhook processing errors

- [ ] **Performance Monitoring**
  - Monitor checkout session creation time
  - Monitor webhook processing time
  - Set up alerts for slow responses

## Post-Deployment

### Verification

- [ ] **Test Complete Flow**
  - End-to-end payment test with real card
  - Verify webhook received and processed
  - Verify booking updated correctly
  - Verify success page works

- [ ] **Monitor First Payments**
  - Watch first few real payments closely
  - Verify webhooks are received
  - Check for any errors in logs

- [ ] **Verify Webhook Endpoint**
  - Check Stripe Dashboard → Webhooks
  - Verify endpoint is active
  - Check recent deliveries are successful

### Documentation

- [ ] **Update Team Documentation**
  - Share Stripe Dashboard access
  - Document webhook endpoint URL
  - Document environment variables

- [ ] **Customer Support**
  - Prepare payment troubleshooting guide
  - Document common payment issues
  - Set up support process for payment problems

## Rollback Plan

If issues occur:

1. **Disable Payments Temporarily**
   - Remove "Pay Now" buttons from UI
   - Or return error from checkout endpoint
   - Keep webhook endpoint active to process pending payments

2. **Investigate Issues**
   - Check Stripe Dashboard for errors
   - Review application logs
   - Check webhook delivery status

3. **Fix and Redeploy**
   - Fix identified issues
   - Test thoroughly
   - Redeploy with fixes

## Security Reminders

- ⚠️ **Never commit secret keys** to version control
- ⚠️ **Always verify webhook signatures** before processing
- ⚠️ **Use HTTPS** for all webhook endpoints
- ⚠️ **Rotate keys** if compromised
- ⚠️ **Monitor** for suspicious activity
- ⚠️ **Limit access** to Stripe Dashboard

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Stripe Status**: https://status.stripe.com
- **Webhook Testing**: Use Stripe Dashboard → Webhooks → Send test webhook

---

*Last updated: After production setup completion*
