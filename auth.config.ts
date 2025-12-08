import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";

/**
 * Authentication configuration for NextAuth v5
 * 
 * This file defines:
 * - Authentication providers (Credentials, Google, GitHub)
 * - Session strategy
 * - Callbacks for user data
 * - Pages customization
 * - Security settings
 */

// Login credentials validation schema
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    /**
     * Authorize callback - validates credentials during sign in
     */
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage = nextUrl.pathname.startsWith("/auth");
      const isOnApiRoute = nextUrl.pathname.startsWith("/api");

      // Allow access to auth pages and API routes
      if (isOnAuthPage || isOnApiRoute) {
        return true;
      }

      // Redirect to sign in if not logged in
      if (!isLoggedIn && !isOnAuthPage) {
        return false; // Redirect to sign in
      }

      return true;
    },
    /**
     * JWT callback - runs whenever a JWT is created or updated
     */
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }

      return token;
    },
    /**
     * Session callback - returns session data to client
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.email = token.email as string;
      }

      return session;
    },
  },
  providers: [
    /**
     * Credentials Provider - Email/Password authentication
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
          // Password field exists in schema but TypeScript types need migration
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
    /**
     * Google OAuth Provider
     */
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false, // Security: prevent account linking
    }),
    /**
     * GitHub OAuth Provider
     */
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false, // Security: prevent account linking
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for serverless compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
