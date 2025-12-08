import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";

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

const { handlers } = NextAuth({
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
        try {
          // Validate input
          const validatedFields = credentialsSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

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
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    ...authConfig.providers, // Include OAuth providers from config
  ],
  adapter: PrismaAdapter(prisma) as any, // Type assertion to handle adapter version mismatch
  trustHost: true,
});

export const { GET, POST } = handlers;
