import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth configuration and initialization
 * 
 * This is the main auth export that NextAuth uses.
 * It combines the auth config with the Prisma adapter.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Required for Vercel deployments
});
