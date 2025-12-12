# Cron Jobs Setup Guide

This guide explains how to set up and configure cron jobs for the Linglix platform.

## Available Cron Jobs

### 1. Session Reminders (`/api/cron/session-reminders`)
- **Schedule**: Every hour (`0 * * * *`)
- **Purpose**: Sends email reminders to students and tutors 24 hours and 1 hour before sessions
- **Status**: ✅ Configured

### 2. Refund Expired Bookings (`/api/cron/refund-expired-bookings`)
- **Schedule**: Every hour (`0 * * * *`)
- **Purpose**: Automatically refunds bookings that are PENDING and past their scheduled time (tutor didn't confirm)
- **Status**: ✅ Configured

## Vercel Cron Configuration

The cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/session-reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/refund-expired-bookings",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Schedule Format

The schedule uses cron syntax: `minute hour day month weekday`

- `0 * * * *` = Every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
- `*/30 * * * *` = Every 30 minutes
- `0 */2 * * *` = Every 2 hours
- `0 0 * * *` = Once per day at midnight

## Security: CRON_SECRET

For additional security (especially for manual testing or non-Vercel cron services), set a `CRON_SECRET` environment variable.

### Generate a Secure Secret

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option 3: Using Python**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Set Environment Variable

**Local Development (.env.local)**
```env
CRON_SECRET=your-generated-secret-here
```

**Vercel Production**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - **Key**: `CRON_SECRET`
   - **Value**: Your generated secret
   - **Environment**: Production (and Preview if needed)

### How It Works

The cron endpoints verify requests using:

1. **Vercel Cron Header** (automatic in production)
   - Vercel automatically adds `x-vercel-cron` header
   - No configuration needed for Vercel-deployed cron jobs

2. **CRON_SECRET Token** (optional, for manual testing)
   - Send `Authorization: Bearer <CRON_SECRET>` header
   - Useful for testing locally or using external cron services

3. **Development Mode** (local only)
   - Allows requests in development for testing
   - Logs warnings for security awareness

## Testing Cron Jobs

### Manual Testing (Local)

```bash
# Test with CRON_SECRET
curl -X POST http://localhost:3000/api/cron/refund-expired-bookings \
  -H "Authorization: Bearer your-cron-secret-here"

# Test session reminders
curl -X GET http://localhost:3000/api/cron/session-reminders \
  -H "Authorization: Bearer your-cron-secret-here"
```

### Testing in Production

Vercel Cron jobs run automatically, but you can trigger them manually:

1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. Click on the cron job
3. Click "Trigger Now" to test

## Monitoring

### Check Cron Job Logs

**Vercel Dashboard**
1. Go to your project
2. Navigate to "Functions" or "Logs"
3. Filter by cron job path

**Application Logs**
- All cron jobs log their execution
- Check for `"Processing expired unconfirmed bookings"` or `"Session reminders cron job completed"`
- Monitor success/failure rates

### Key Metrics to Monitor

- **Refund Cron**:
  - Number of bookings processed
  - Success rate
  - Failed refunds (requires manual intervention)
  - Execution duration

- **Reminder Cron**:
  - Emails sent (24h and 1h reminders)
  - Failed email sends
  - Execution duration

## Troubleshooting

### Cron Job Not Running

1. **Check Vercel Configuration**
   - Verify `vercel.json` is committed
   - Check cron jobs appear in Vercel dashboard
   - Ensure deployment succeeded

2. **Check Environment Variables**
   - Verify `CRON_SECRET` is set (if using manual triggers)
   - Check other required env vars are set

3. **Check Logs**
   - Look for authentication errors
   - Check for execution errors
   - Verify cron job is being triggered

### Refunds Not Processing

1. **Check Booking Status**
   - Bookings must be `PENDING`
   - Must have `paymentId` (were paid)
   - Must be past `scheduledAt` time

2. **Check Stripe Configuration**
   - Verify `STRIPE_SECRET_KEY` is set
   - Check Stripe API is accessible
   - Review Stripe logs for errors

3. **Check Application Logs**
   - Look for refund processing errors
   - Check for transaction failures
   - Review idempotency logs

## Best Practices

1. **Use Strong Secrets**
   - Generate 32+ character random secrets
   - Never commit secrets to git
   - Rotate secrets periodically

2. **Monitor Regularly**
   - Check cron job execution logs weekly
   - Monitor error rates
   - Set up alerts for failures

3. **Test Before Production**
   - Test cron jobs in preview environment
   - Verify email delivery
   - Confirm refund processing works

4. **Keep Schedules Reasonable**
   - Don't run too frequently (waste resources)
   - Don't run too infrequently (delayed processing)
   - Hourly is usually good for most use cases

## Schedule Recommendations

- **Session Reminders**: Every hour (catches all upcoming sessions)
- **Refund Expired Bookings**: Every hour (processes expired bookings quickly)
- **Future**: Consider daily/weekly analytics cron jobs

---

*Last updated: After refund system implementation*
