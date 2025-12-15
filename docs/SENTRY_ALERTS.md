# Sentry Monitoring Alerts Setup

Complete guide for setting up monitoring alerts in Sentry for the Linglix application.

## Overview

Sentry alerts help you stay informed about critical issues in production. This guide covers:
- Setting up alert rules in Sentry dashboard
- Configuring alert notifications
- Best practices for alert thresholds
- Alert types for different scenarios

## Prerequisites

1. Sentry account with project created
2. `SENTRY_DSN` environment variable configured
3. Sentry integration working (errors are being captured)

## Alert Rules Setup

### 1. Critical Error Rate Alert

**Purpose:** Alert when error rate exceeds threshold

**Setup:**
1. Go to Sentry Dashboard → Alerts → Create Alert Rule
2. Select "Issues" as the alert type
3. Configure:
   - **Condition:** When an issue is seen more than 100 times in 5 minutes
   - **Filter:** Environment = production
   - **Action:** Send notification to team

**Recommended Thresholds:**
- **Critical:** > 100 errors in 5 minutes
- **Warning:** > 50 errors in 5 minutes

### 2. Payment Failure Alert

**Purpose:** Alert on payment-related errors

**Setup:**
1. Create Alert Rule
2. Configure:
   - **Condition:** When an issue is seen more than 5 times in 1 minute
   - **Filter:** 
     - Tags: `route` contains `/api/payments`
     - OR Tags: `payment` = true
   - **Action:** Send immediate notification (Slack/Email/PagerDuty)

**Recommended Thresholds:**
- **Critical:** > 5 payment errors in 1 minute
- **Warning:** > 2 payment errors in 1 minute

### 3. Database Error Alert

**Purpose:** Alert on database connection or query errors

**Setup:**
1. Create Alert Rule
2. Configure:
   - **Condition:** When an issue is seen more than 10 times in 5 minutes
   - **Filter:**
     - Tags: `error_type` = `database`
     - OR Message contains "Prisma" or "PostgreSQL"
   - **Action:** Send notification to DevOps team

**Recommended Thresholds:**
- **Critical:** > 10 database errors in 5 minutes
- **Warning:** > 5 database errors in 5 minutes

### 4. Authentication Failure Alert

**Purpose:** Alert on authentication-related errors (potential security issue)

**Setup:**
1. Create Alert Rule
2. Configure:
   - **Condition:** When an issue is seen more than 20 times in 1 minute
   - **Filter:**
     - Tags: `route` contains `/api/auth`
     - OR Tags: `auth` = true
   - **Action:** Send notification to security team

**Recommended Thresholds:**
- **Critical:** > 20 auth errors in 1 minute (potential attack)
- **Warning:** > 10 auth errors in 1 minute

### 5. API Error Rate Alert

**Purpose:** Alert when overall API error rate is high

**Setup:**
1. Create Alert Rule
2. Configure:
   - **Condition:** When error rate > 5% in 5 minutes
   - **Filter:** Environment = production
   - **Action:** Send notification to engineering team

**Recommended Thresholds:**
- **Critical:** > 5% error rate
- **Warning:** > 2% error rate

### 6. Performance Degradation Alert

**Purpose:** Alert when API response times are slow

**Setup:**
1. Create Alert Rule
2. Configure:
   - **Condition:** When transaction duration > 5 seconds
   - **Filter:** 
     - Transaction type = HTTP request
     - Environment = production
   - **Action:** Send notification

**Recommended Thresholds:**
- **Critical:** > 5 seconds
- **Warning:** > 2 seconds

### 7. New Issue Alert

**Purpose:** Alert when a new type of error appears

**Setup:**
1. Create Alert Rule
2. Configure:
   - **Condition:** When a new issue is created
   - **Filter:** 
     - Environment = production
     - Level = error or fatal
   - **Action:** Send notification (optional - can be noisy)

**Recommended:** Use sparingly, only for critical environments

### 8. Booking System Alert

**Purpose:** Alert on booking-related errors

**Setup:**
1. Create Alert Rule
2. Configure:
   - **Condition:** When an issue is seen more than 10 times in 5 minutes
   - **Filter:**
     - Tags: `route` contains `/api/bookings`
   - **Action:** Send notification

**Recommended Thresholds:**
- **Critical:** > 10 booking errors in 5 minutes
- **Warning:** > 5 booking errors in 5 minutes

## Notification Channels

### Email Notifications
- **Use for:** All alerts
- **Recipients:** Engineering team, DevOps team
- **Setup:** Sentry → Settings → Notifications → Email

### Slack Integration
- **Use for:** Critical alerts only
- **Channel:** #linglix-alerts
- **Setup:** Sentry → Settings → Integrations → Slack

### PagerDuty Integration (Optional)
- **Use for:** Critical production issues
- **Setup:** Sentry → Settings → Integrations → PagerDuty

## Alert Configuration Best Practices

### 1. Avoid Alert Fatigue
- Set appropriate thresholds
- Use different alert levels (Critical, Warning, Info)
- Group related alerts
- Use alert rules to filter noise

### 2. Context is Key
- Ensure errors include relevant tags (route, user_id, etc.)
- Use breadcrumbs for debugging
- Include request context in errors

### 3. Escalation Policies
- **Critical:** Immediate notification + escalation after 15 minutes
- **Warning:** Notification within 1 hour
- **Info:** Daily digest

### 4. Environment-Specific Alerts
- Production: All alerts enabled
- Staging: Critical alerts only
- Development: Disabled

## Alert Rules JSON Export

For programmatic setup, you can use Sentry's API or export alert rules. Here's an example structure:

```json
{
  "name": "Critical Error Rate",
  "conditions": [
    {
      "id": "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
      "interval": "5m",
      "value": 100
    }
  ],
  "filters": [
    {
      "id": "sentry.rules.filters.environment.EnvironmentFilter",
      "value": "production"
    }
  ],
  "actions": [
    {
      "id": "sentry.rules.actions.notify_event_service.NotifyEventServiceAction",
      "service": "slack",
      "channel": "#linglix-alerts"
    }
  ]
}
```

## Monitoring Dashboard

### Key Metrics to Monitor

1. **Error Rate**
   - Overall error rate
   - Error rate by route
   - Error rate by user

2. **Performance**
   - P50, P95, P99 response times
   - Slowest transactions
   - Database query times

3. **User Impact**
   - Affected users
   - Affected sessions
   - Geographic distribution

4. **Release Health**
   - Crash-free sessions
   - Crash-free users
   - Release adoption

## Testing Alerts

### Test Alert Rules

1. Create a test error in production (temporarily)
2. Verify alert triggers
3. Check notification delivery
4. Verify alert resolves when error stops

### Test Notification Channels

1. Send test notification from Sentry
2. Verify all team members receive it
3. Test escalation policies
4. Verify alert suppression works

## Maintenance

### Regular Reviews

- **Weekly:** Review alert effectiveness
- **Monthly:** Adjust thresholds based on trends
- **Quarterly:** Review and remove unused alerts

### Alert Tuning

- Monitor false positive rate
- Adjust thresholds based on actual error patterns
- Add new alerts for new features
- Remove alerts for deprecated features

## Troubleshooting

### Alerts Not Triggering

1. Check alert rule conditions
2. Verify filters are correct
3. Check if events are being sent to Sentry
4. Verify environment tags are set correctly

### Too Many Alerts

1. Increase thresholds
2. Add more specific filters
3. Group related alerts
4. Use alert suppression rules

### Missing Alerts

1. Check notification channel configuration
2. Verify team member email addresses
3. Check spam folders
4. Verify integration is connected

## Next Steps

1. Set up alert rules in Sentry dashboard
2. Configure notification channels
3. Test alert delivery
4. Monitor and tune thresholds
5. Set up on-call rotation (if applicable)

## Resources

- [Sentry Alert Rules Documentation](https://docs.sentry.io/product/alerts/alert-rules/)
- [Sentry Notification Integrations](https://docs.sentry.io/product/notifications/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
