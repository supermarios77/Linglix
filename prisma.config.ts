import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma configuration file
 * 
 * In Prisma 7+, connection URLs are configured here instead of schema.prisma
 * This allows for better separation of concerns and supports Prisma Accelerate
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Direct database connection for migrations and introspection
    // Use DIRECT_URL if available, otherwise fall back to DATABASE_URL
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});
