/**
 * Rate Limiting Utility
 * 
 * Provides rate limiting for API routes using Upstash Redis.
 * Falls back to in-memory rate limiting in development if Upstash is not configured.
 * 
 * Production: Uses Upstash Redis for distributed rate limiting
 * Development: Uses in-memory store (single instance only)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

// In-memory fallback for development
class MemoryStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  async get(key: string): Promise<number | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Clean expired entries
    if (Date.now() > entry.resetAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.count;
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    this.store.set(key, {
      count: value,
      resetAt: Date.now() + ttl * 1000,
    });
  }

  async increment(key: string, ttl: number): Promise<number> {
    const entry = this.store.get(key);
    const now = Date.now();
    
    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + ttl * 1000 });
      return 1;
    }
    
    entry.count++;
    return entry.count;
  }
}

// Rate limit configurations for different route types
export const RateLimitConfig = {
  // Strict limits for authentication routes (prevent brute force)
  AUTH: {
    requests: 5,
    window: "15 m", // 15 minutes
  },
  
  // Moderate limits for general API routes
  GENERAL: {
    requests: 30,
    window: "1 m", // 1 minute
  },
  
  // Moderate limits for payment routes
  PAYMENT: {
    requests: 10,
    window: "1 m", // 1 minute
  },
  
  // Moderate limits for admin routes
  ADMIN: {
    requests: 20,
    window: "1 m", // 1 minute
  },
  
  // Stricter limits for booking creation
  BOOKING: {
    requests: 10,
    window: "1 m", // 1 minute
  },
} as const;

type RateLimitType = keyof typeof RateLimitConfig;

/**
 * Get the identifier for rate limiting (IP address, user ID, or custom identifier)
 */
function getIdentifier(
  request: NextRequest | null,
  userId?: string,
  customIdentifier?: string
): string {
  // If custom identifier provided (e.g., email for auth), use it
  if (customIdentifier) {
    return `custom:${customIdentifier}`;
  }
  
  // If user is authenticated, use user ID for more accurate rate limiting
  if (userId) {
    return `user:${userId}`;
  }
  
  // Otherwise, use IP address
  if (request) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    return `ip:${ip}`;
  }
  
  // Fallback if no request object (shouldn't happen in normal flow)
  return "unknown";
}

/**
 * Create a rate limiter instance
 */
function createRateLimiter(type: RateLimitType): Ratelimit | null {
  const config = RateLimitConfig[type];
  
  // Check if Upstash is configured
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (upstashUrl && upstashToken) {
    // Production: Use Upstash Redis
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });
    
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `ratelimit:${type.toLowerCase()}`,
    });
  }
  
  // Development: Use in-memory store (single instance only)
  if (process.env.NODE_ENV === "development") {
    const memoryStore = new MemoryStore();
    
    return new Ratelimit({
      redis: memoryStore as any,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: false,
      prefix: `ratelimit:${type.toLowerCase()}`,
    });
  }
  
  // Production without Upstash: return null (rate limiting disabled)
  // This allows the app to work but logs a warning
  // Note: logger is not imported here to avoid circular dependencies
  // This warning is acceptable as it's a configuration issue, not a runtime error
  if (process.env.NODE_ENV === "production") {
    // In production, we should log this properly, but logger might cause circular dependency
    // This is a configuration warning, so it's acceptable to use console.warn here
    console.warn(
      `[RATE_LIMIT] Rate limiting disabled for ${type}. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.`
    );
  }
  
  return null;
}

// Cache rate limiter instances
const rateLimiters = new Map<RateLimitType, Ratelimit | null>();

function getRateLimiter(type: RateLimitType): Ratelimit | null {
  if (!rateLimiters.has(type)) {
    rateLimiters.set(type, createRateLimiter(type));
  }
  return rateLimiters.get(type) || null;
}

/**
 * Check rate limit for a request
 * 
 * @param request - Next.js request object (can be null for custom identifiers)
 * @param type - Type of rate limit to apply
 * @param userId - Optional user ID for authenticated requests
 * @param customIdentifier - Optional custom identifier (e.g., email for auth routes)
 * @returns Object with `success` (boolean) and `limit`, `remaining`, `reset` (if rate limited)
 */
export async function checkRateLimit(
  request: NextRequest | null,
  type: RateLimitType,
  userId?: string,
  customIdentifier?: string
): Promise<{
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}> {
  const limiter = getRateLimiter(type);
  
  // If rate limiting is not configured, allow the request
  if (!limiter) {
    return { success: true };
  }
  
  const identifier = getIdentifier(request, userId, customIdentifier);
  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Create a rate limit error response
 */
export function createRateLimitResponse(limit: number, reset: number): Response {
  const resetDate = new Date(reset);
  const retryAfter = Math.ceil((resetDate.getTime() - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter,
      resetAt: resetDate.toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetDate.toISOString(),
      },
    }
  );
}
