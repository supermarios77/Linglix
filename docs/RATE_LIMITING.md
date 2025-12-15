# Rate Limiting Setup

Rate limiting is implemented to protect API routes from abuse, brute force attacks, and excessive usage.

## Overview

Rate limiting uses **Upstash Redis** for production (distributed rate limiting across serverless functions) and falls back to in-memory storage in development.

## Rate Limit Configurations

Different route types have different rate limits:

| Route Type | Limit | Window | Use Case |
|------------|-------|--------|----------|
| **AUTH** | 5 requests | 15 minutes | Authentication routes (register, signin, password reset) |
| **GENERAL** | 30 requests | 1 minute | General API routes (GET requests, listings) |
| **BOOKING** | 10 requests | 1 minute | Booking creation |
| **PAYMENT** | 10 requests | 1 minute | Payment checkout |
| **ADMIN** | 20 requests | 1 minute | Admin routes |

## Setup

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Choose a region close to your Vercel deployment
4. Copy the **REST URL** and **REST Token**

### 2. Configure Environment Variables

Add to your `.env` file (and Vercel environment variables):

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 3. Development Mode

In development, if Upstash is not configured, the system automatically falls back to in-memory rate limiting. This works for single-instance development but **will not work correctly in production** (each serverless function has its own memory).

**Important**: Always configure Upstash for production deployments.

## How It Works

### Identifier Strategy

Rate limiting uses different identifiers based on context:

1. **Authenticated requests**: Uses user ID (`user:{userId}`)
2. **Unauthenticated requests**: Uses IP address (`ip:{ipAddress}`)
3. **Auth routes**: Uses email address (`custom:{email}`) to prevent brute force on specific accounts

### Response Headers

When rate limited, the API returns:

- **Status Code**: `429 Too Many Requests`
- **Headers**:
  - `Retry-After`: Seconds until the rate limit resets
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests (0 when rate limited)
  - `X-RateLimit-Reset`: ISO timestamp when limit resets

### Example Response

```json
{
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 120,
  "resetAt": "2024-01-15T10:30:00.000Z"
}
```

## Protected Routes

Rate limiting is applied to:

### Authentication Routes
- `POST /api/auth/register` - AUTH limit
- `POST /api/auth/[...nextauth]` (signin) - AUTH limit (email-based)
- `POST /api/auth/forgot-password` - AUTH limit
- `POST /api/auth/reset-password` - AUTH limit

### Booking Routes
- `GET /api/bookings` - GENERAL limit
- `POST /api/bookings` - BOOKING limit

### Payment Routes
- `POST /api/payments/checkout` - PAYMENT limit

### Admin Routes
- `GET /api/admin/stats` - ADMIN limit

## Customization

To adjust rate limits, edit `lib/rate-limit.ts`:

```typescript
export const RateLimitConfig = {
  AUTH: {
    requests: 5,      // Adjust as needed
    window: "15 m",   // Adjust window
  },
  // ... other configs
};
```

## Monitoring

Rate limit events are logged. In production, monitor:

- Rate limit violations (429 responses)
- Patterns of abuse
- Legitimate users hitting limits

Consider adjusting limits based on usage patterns.

## Troubleshooting

### Rate limiting not working

1. **Check environment variables**: Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
2. **Check logs**: Look for warnings about rate limiting being disabled
3. **Verify Upstash connection**: Test the connection in Upstash console

### Users hitting limits too quickly

- Adjust limits in `RateLimitConfig`
- Consider different limits for different user tiers
- Implement user-specific limits based on subscription level

### Development issues

- In development without Upstash, rate limiting uses in-memory storage
- This is fine for local development but won't work across multiple instances
- Always use Upstash in production

## Best Practices

1. **Start conservative**: Begin with stricter limits and relax based on usage
2. **Monitor patterns**: Watch for abuse patterns and adjust accordingly
3. **User feedback**: If legitimate users hit limits, adjust or implement tiered limits
4. **Error messages**: Rate limit errors should be clear but not reveal internal details
5. **Retry logic**: Clients should implement exponential backoff when receiving 429 responses
