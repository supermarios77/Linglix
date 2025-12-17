import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { captureDatabaseError } from "@/lib/monitoring/sentry-alerts";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton instance
 * 
 * Prevents multiple instances in development (Next.js hot reload)
 * and ensures proper connection pooling in production (serverless)
 * 
 * Production optimizations:
 * - Error-only logging to reduce overhead
 * - Connection pooling handled by Neon
 * - Automatic connection management
 * - Uses DATABASE_URL from environment (configured in prisma.config.ts for migrations)
 * - Prisma 7+ requires adapter for PostgreSQL
 */
// Validate required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required but not set"
  );
}

// Configure connection pool with proper timeout settings
// Prevents ETIMEDOUT errors in serverless environments
// Use connection pooler URL if available (better for serverless), otherwise use direct URL
const connectionString = process.env.DATABASE_URL || "";

const pool = new Pool({
  connectionString,
  // Connection timeout settings - increased for serverless environments
  connectionTimeoutMillis: 20000, // 20 seconds to establish connection (increased from 10s)
  idleTimeoutMillis: 60000, // 60 seconds before closing idle connections (increased from 30s)
  max: 10, // Maximum number of clients in the pool
  // Query timeout - increased for complex queries
  statement_timeout: 60000, // 60 seconds for queries (increased from 30s)
  // Keep connections alive longer in serverless
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Retry configuration
  allowExitOnIdle: true,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : [
          {
            emit: "event",
            level: "error",
          },
        ],
    // Connection pooling is handled by Neon's built-in pooler
    // No need to configure connection_limit for serverless
    errorFormat: "pretty",
  });

// Enhanced error handling for database errors
if (process.env.NODE_ENV === "production") {
  prisma.$on("error" as never, (e: any) => {
    captureDatabaseError(e, {
      operation: "query",
    });
  });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Note: Graceful shutdown is not needed in serverless environments (Vercel, etc.)
// Connections are automatically managed by the platform
// process.on is not available in Edge Runtime, so we don't use it
