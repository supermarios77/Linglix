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
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // Connection pooling is handled by Neon's built-in pooler
    // No need to configure connection_limit for serverless
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown in production
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
