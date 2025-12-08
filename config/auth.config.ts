import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { Role } from "@prisma/client";

/**
 * Authentication configuration for NextAuth v5 (Edge Runtime compatible)
 * 
 * This file defines:
 * - OAuth providers (Google) - Edge Runtime compatible
 * - Session strategy
 * - Callbacks for user data
 * - Pages customization
 * - Security settings
 * 
 * Note: Credentials provider is defined in the API route since it requires Prisma (Node.js runtime only)
 */
export const authConfig = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    /**
     * JWT callback - runs whenever a JWT is created or updated
     */
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        // Type-safe role assignment - user.role is guaranteed by our authorize function
        // The authorize function in route.ts always returns a user with role
        token.role = (user as { role: Role }).role;
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
     * Google OAuth Provider
     * Only enabled if credentials are provided
     */
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false, // Security: prevent account linking
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt", // Use JWT for serverless compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXTAUTH_SECRET is required in production");
    }
    return "development-secret-change-in-production";
  })(),
} satisfies NextAuthConfig;