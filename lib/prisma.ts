import { PrismaClient } from "@prisma/client";

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
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Connection pooling is handled by Neon's built-in pooler
    // No need to configure connection_limit for serverless
    // DATABASE_URL is automatically read from process.env
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Note: Graceful shutdown is not needed in serverless environments (Vercel, etc.)
// Connections are automatically managed by the platform
// process.on is not available in Edge Runtime, so we don't use it
