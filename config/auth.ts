import NextAuth from "next-auth";
import { authConfig } from "@/config/auth.config";

/**
 * NextAuth configuration for middleware (Edge Runtime compatible)
 * 
 * This export is used by middleware and doesn't include the Prisma adapter
 * since Prisma cannot run in Edge Runtime. The adapter is only used in
 * API routes (see app/api/auth/[...nextauth]/route.ts)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true, // Required for Vercel deployments
});
