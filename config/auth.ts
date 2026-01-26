import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";

/**
 * NextAuth configuration for server components
 * 
 * This file provides the auth function for use in Server Components and API routes.
 * It uses getServerSession which is the recommended approach for Next.js 16 App Router.
 * 
 * Note: authOptions is exported from app/api/auth/[...nextauth]/route.ts
 * to avoid circular dependencies and ensure consistency.
 */

/**
 * Get the current session in server components and API routes
 * This is the recommended way to access authentication in Next.js 16 App Router
 */
export async function auth() {
  // Dynamically import authOptions to avoid circular dependencies
  const { authOptions } = await import("@/app/api/auth/[...nextauth]/route");
  return getServerSession(authOptions as NextAuthOptions);
}

// Note: signIn and signOut are client-side functions from next-auth/react
// For server-side authentication, use the auth() function above
