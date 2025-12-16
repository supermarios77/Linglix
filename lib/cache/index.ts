/**
 * Caching Utility
 * 
 * Provides caching functionality using Upstash Redis.
 * Falls back to in-memory cache in development if Redis is not configured.
 * 
 * Production: Uses Upstash Redis for distributed caching
 * Development: Uses in-memory store (single instance only)
 */

import { Redis } from "@upstash/redis";

// In-memory fallback for development
class MemoryCache {
  private store: Map<string, { value: any; expiresAt: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }
}

// Cache instance (singleton)
let cacheInstance: Redis | MemoryCache | null = null;

/**
 * Get cache instance
 */
function getCacheInstance(): Redis | MemoryCache {
  if (cacheInstance) {
    return cacheInstance;
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    // Production: Use Upstash Redis
    cacheInstance = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });
  } else {
    // Development: Use in-memory cache
    if (process.env.NODE_ENV === "development") {
      cacheInstance = new MemoryCache();
    } else {
      // Production without Redis: log warning but allow app to work
      console.warn(
        "Caching disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable."
      );
      cacheInstance = new MemoryCache();
    }
  }

  return cacheInstance;
}

/**
 * Cache configuration for different data types
 */
export const CacheConfig = {
  // Public data (can be cached longer)
  TUTORS_LIST: {
    ttl: 300, // 5 minutes
    keyPrefix: "tutors:list",
  },
  FEATURED_TUTORS: {
    ttl: 600, // 10 minutes
    keyPrefix: "tutors:featured",
  },
  TUTOR_SPECIALTIES: {
    ttl: 3600, // 1 hour (rarely changes)
    keyPrefix: "tutors:specialties",
  },
  TUTOR_DETAIL: {
    ttl: 300, // 5 minutes
    keyPrefix: "tutor:detail",
  },
  
  // User-specific data (shorter TTL, user-specific keys)
  RECOMMENDED_TUTORS: {
    ttl: 300, // 5 minutes
    keyPrefix: "tutors:recommended",
  },
  USER_BOOKINGS: {
    ttl: 60, // 1 minute (changes frequently)
    keyPrefix: "bookings:user",
  },
  TUTOR_BOOKINGS: {
    ttl: 60, // 1 minute
    keyPrefix: "bookings:tutor",
  },
  
  // Admin data
  ADMIN_STATS: {
    ttl: 300, // 5 minutes
    keyPrefix: "admin:stats",
  },
  
  // Availability (very short TTL due to real-time nature)
  TUTOR_AVAILABILITY: {
    ttl: 30, // 30 seconds
    keyPrefix: "availability:tutor",
  },
} as const;

/**
 * Generate cache key
 */
export function generateCacheKey(
  prefix: string,
  ...parts: (string | number | undefined)[]
): string {
  const validParts = parts.filter((p) => p !== undefined && p !== null);
  return `${prefix}:${validParts.join(":")}`;
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cache = getCacheInstance();
    const value = await cache.get<T>(key);
    return value;
  } catch (error) {
    // If cache fails, return null (cache miss)
    if (process.env.NODE_ENV === "development") {
      console.error("[Cache] Get error:", error);
    }
    return null;
  }
}

/**
 * Set value in cache
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number
): Promise<void> {
  try {
    const cache = getCacheInstance();
    
    if (cache instanceof Redis) {
      // Upstash Redis
      await cache.set(key, value, { ex: ttlSeconds });
    } else {
      // Memory cache
      await cache.set(key, value, ttlSeconds);
    }
  } catch (error) {
    // If cache fails, log but don't throw (fail gracefully)
    if (process.env.NODE_ENV === "development") {
      console.error("[Cache] Set error:", error);
    }
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const cache = getCacheInstance();
    if (cache instanceof Redis) {
      await cache.del(key);
    } else {
      await (cache as MemoryCache).delete(key);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Cache] Delete error:", error);
    }
  }
}

/**
 * Delete multiple keys matching a pattern
 * Note: Upstash Redis doesn't support pattern deletion natively,
 * so this is a best-effort implementation
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const cache = getCacheInstance();
    
    if (cache instanceof Redis) {
      // Upstash Redis: Use SCAN to find matching keys
      // Note: This is a simplified version - for production, consider using
      // a more sophisticated pattern matching approach
      const keys = await cache.keys(`${pattern}*`);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => cache.del(key)));
      }
    } else {
      // Memory cache
      await (cache as MemoryCache).deletePattern(pattern);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Cache] Delete pattern error:", error);
    }
  }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const cache = getCacheInstance();
    
    if (cache instanceof Redis) {
      const result = await cache.exists(key);
      return result === 1;
    } else {
      return await (cache as MemoryCache).exists(key);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Cache] Exists error:", error);
    }
    return false;
  }
}

/**
 * Get or set cache value (cache-aside pattern)
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch data
  const value = await fetcher();

  // Set in cache (non-blocking)
  setCache(key, value, ttlSeconds).catch((error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Cache] Failed to set cache:", error);
    }
  });

  return value;
}

/**
 * Invalidate cache for a specific entity
 */
export async function invalidateCache(
  entityType: keyof typeof CacheConfig,
  ...identifiers: (string | number)[]
): Promise<void> {
  const config = CacheConfig[entityType];
  const key = generateCacheKey(config.keyPrefix, ...identifiers);
  await deleteCache(key);
  
  // Also invalidate related patterns
  if (entityType === "TUTOR_DETAIL" || entityType === "FEATURED_TUTORS") {
    // Invalidate tutors list when a tutor is updated
    await deleteCachePattern("tutors:list");
    await deleteCachePattern("tutors:featured");
    await deleteCachePattern("tutors:recommended");
  }
  
  if (entityType === "TUTOR_SPECIALTIES") {
    // Invalidate all tutor-related caches when specialties change
    await deleteCachePattern("tutors:");
  }
}

/**
 * Invalidate all caches (use with caution - mainly for admin operations)
 */
export async function invalidateAllCache(): Promise<void> {
  try {
    await deleteCachePattern("tutors:");
    await deleteCachePattern("bookings:");
    await deleteCachePattern("admin:");
    await deleteCachePattern("availability:");
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Cache] Failed to invalidate all cache:", error);
    }
  }
}
