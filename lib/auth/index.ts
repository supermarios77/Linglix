import { auth } from "@/config/auth";
import { Role } from "@prisma/client";

/**
 * Server-side authentication utilities
 * 
 * Use these functions in Server Components and API routes
 */

/**
 * Get the current session
 * @returns Current user session or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get the current user's role
 * @returns User role or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<Role | null> {
  const session = await auth();
  return (session?.user?.role as Role) ?? null;
}

/**
 * Check if user has a specific role
 * @param role - Role to check
 * @returns true if user has the role, false otherwise
 */
export async function hasRole(role: Role): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === role;
}

/**
 * Require authentication - throws HttpError if not authenticated
 * @returns Current user (never null)
 * @throws HttpError if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const { Errors } = await import("../errors");
    throw Errors.Unauthorized();
  }
  return user;
}

/**
 * Require specific role - throws HttpError if user doesn't have role
 * @param role - Required role
 * @returns Current user (never null)
 * @throws HttpError if not authenticated or doesn't have role
 */
export async function requireRole(role: Role) {
  const user = await requireAuth();
  if (user.role !== role) {
    const { Errors } = await import("../errors");
    throw Errors.Forbidden();
  }
  return user;
}

// Re-export utilities
export * from "./utils";