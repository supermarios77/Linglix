import { handlers } from "@/auth";

/**
 * NextAuth API route handler
 * 
 * This route handles all authentication requests:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/*
 * - /api/auth/session
 * - /api/auth/csrf
 * 
 * Production considerations:
 * - CSRF protection enabled by default
 * - Secure session cookies
 * - Rate limiting should be added at edge level
 */
export const { GET, POST } = handlers;
