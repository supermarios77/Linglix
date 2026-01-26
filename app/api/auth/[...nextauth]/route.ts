import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/config/auth.config";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * NextAuth API route handler (Node.js Runtime)
 * 
 * This route handles all authentication requests:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/*
 * - /api/auth/session
 * - /api/auth/csrf
 * 
 * The Prisma adapter and Credentials provider are only used here (Node.js runtime),
 * not in middleware (Edge Runtime).
 * 
 * Production considerations:
 * - CSRF protection enabled by default
 * - Secure session cookies
 * - Rate limiting should be added at edge level
 * - Prisma adapter for database operations
 */

// Login credentials validation schema
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Create authOptions for reuse in both NextAuth instance and getServerSession
const authOptions = {
  ...authConfig,
  providers: [
    /**
     * Credentials Provider - Email/Password authentication
     * Only defined here since it requires Prisma (Node.js runtime)
     */
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Extract email for error logging (before try block for scope)
        const emailForLogging = credentials?.email ? "***" : undefined;

        try {
          // Validate input
          const validatedFields = credentialsSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Rate limiting: Use email as identifier (protects against brute force on specific accounts)
          // Note: This doesn't protect against distributed attacks, but prevents brute force on individual accounts
          // For full protection, rate limiting should be added at the edge/middleware level
          const mockRequest = {
            headers: {
              get: (name: string) => {
                // Try to get IP from headers if available (for better rate limiting)
                if (name === "x-forwarded-for" || name === "x-real-ip") {
                  return null; // Not available in authorize function
                }
                return null;
              },
            },
          } as any;

          // Check rate limit using email as identifier
          // This protects against brute force attacks on specific email addresses
          const rateLimit = await checkRateLimit(mockRequest, "AUTH", email.toLowerCase());
          if (!rateLimit.success) {
            // Return null to indicate authentication failure (don't reveal rate limit status)
            // This prevents attackers from knowing if rate limiting is active
            return null;
          }

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user) {
            return null;
          }

          // Type assertion needed until migration is run
          const userWithPassword = user as typeof user & { password: string | null };

          // Check if user has a password (OAuth users won't have passwords)
          if (!userWithPassword.password) {
            return null; // User signed up via OAuth, can't use credentials
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, userWithPassword.password);

          if (!isValidPassword) {
            return null;
          }

          // Return user object (will be available in JWT callback)
          // Note: emailVerified status is checked in the JWT callback
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          // Log error to Sentry in production
          if (process.env.NODE_ENV === "production") {
            const { captureException } = await import("@sentry/nextjs");
            captureException(error, {
              tags: {
                route: "/api/auth/[...nextauth]",
                provider: "credentials",
              },
              extra: {
                hasEmail: !!emailForLogging, // Don't log actual email
              },
            });
          } else {
            // In development, log using logger; in production, Sentry handles it
            const { logger } = await import("@/lib/logger");
            logger.error("Auth error", error instanceof Error ? error : new Error(String(error)));
          }
          // Return null to indicate authentication failure
          // Don't leak error details to prevent information disclosure
          return null;
        }
      },
    }),
    ...authConfig.providers, // Include OAuth providers from config
  ],
  adapter: PrismaAdapter(prisma) as any, // Type assertion to handle adapter version mismatch
  trustHost: true,
};

// Create NextAuth instance and export handlers
const nextAuthInstance = NextAuth(authOptions);
const { handlers } = nextAuthInstance;

// Export authOptions for use with getServerSession in server components
export { authOptions };

// Export signIn and signOut for use in server actions
export const { signIn, signOut } = nextAuthInstance;

export const { GET, POST } = handlers;
