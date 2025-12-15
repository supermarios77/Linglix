import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { Role, TutorApprovalStatus } from "@prisma/client";
import { createErrorResponse } from "@/lib/errors";
import * as Sentry from "@sentry/nextjs";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";
import { getOrSetCache, CacheConfig, generateCacheKey } from "@/lib/cache";

/**
 * API Route: Get Admin Statistics
 * 
 * GET /api/admin/stats
 * 
 * Security:
 * - Requires ADMIN role
 * - Returns platform-wide statistics
 * Rate limited: 20 requests per minute
 * 
 * Production considerations:
 * - Proper error handling with Sentry
 * - Efficient aggregation queries
 * - Cached results (can be added later)
 */
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimit = await checkRateLimit(request, "ADMIN");
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
  }

  try {
    // Require admin role
    await requireRole(Role.ADMIN);

    // Use cache for admin stats (5 minute TTL)
    const cacheKey = generateCacheKey(CacheConfig.ADMIN_STATS.keyPrefix);
    
    const stats = await getOrSetCache(
      cacheKey,
      async () => {
        // Fetch statistics in parallel
        const [
          totalTutors,
          pendingTutors,
          approvedTutors,
          rejectedTutors,
          totalStudents,
          totalBookings,
        ] = await Promise.all([
          // Total tutors
          prisma.user.count({
            where: { role: Role.TUTOR },
          }),
          // Pending tutors
          prisma.tutorProfile.count({
            where: { approvalStatus: TutorApprovalStatus.PENDING },
          }),
          // Approved tutors
          prisma.tutorProfile.count({
            where: { approvalStatus: TutorApprovalStatus.APPROVED },
          }),
          // Rejected tutors
          prisma.tutorProfile.count({
            where: { approvalStatus: TutorApprovalStatus.REJECTED },
          }),
          // Total students
          prisma.user.count({
            where: { role: Role.STUDENT },
          }),
          // Total bookings
          prisma.booking.count(),
        ]);

        return {
          totalTutors,
          pendingTutors,
          approvedTutors,
          rejectedTutors,
          totalStudents,
          totalBookings,
        };
      },
      CacheConfig.ADMIN_STATS.ttl
    );

    return NextResponse.json(stats);
  } catch (error) {
    // Log to Sentry in production
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }

    return createErrorResponse(error, "Failed to fetch statistics");
  }
}

