import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

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
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection timeout settings
  connectionTimeoutMillis: 10000, // 10 seconds to establish connection
  idleTimeoutMillis: 30000, // 30 seconds before closing idle connections
  max: 10, // Maximum number of clients in the pool
  // Query timeout (handled by Prisma)
  statement_timeout: 30000, // 30 seconds for queries
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Connection pooling is handled by Neon's built-in pooler
    // No need to configure connection_limit for serverless
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Note: Graceful shutdown is not needed in serverless environments (Vercel, etc.)
// Connections are automatically managed by the platform
// process.on is not available in Edge Runtime, so we don't use it
