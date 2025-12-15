/**
 * Database Query Optimization Utilities
 * 
 * Helper functions to prevent N+1 queries and optimize database access
 */

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/**
 * Get all unique specialties/languages from tutors
 * Optimized to avoid fetching all tutor data
 */
export async function getAllTutorSpecialties(): Promise<string[]> {
  // Use raw query to get distinct specialties efficiently
  // This avoids fetching all tutor data just to extract specialties
  const result = await prisma.$queryRaw<Array<{ specialty: string }>>(
    Prisma.sql`
      SELECT DISTINCT unnest(specialties) as specialty
      FROM "TutorProfile"
      WHERE "isActive" = true
        AND "approvalStatus" = 'APPROVED'
      ORDER BY specialty
    `
  );

  // Extract specialties from result
  return result.map((row) => row.specialty).filter(Boolean).sort();
}

/**
 * Optimized booking query with all necessary relations
 * Use this instead of multiple separate queries
 */
export const bookingWithRelations = {
  student: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
  tutor: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      availability: {
        where: { isActive: true },
      },
    },
  },
  review: {
    select: {
      id: true,
      rating: true,
      comment: true,
      tags: true,
    },
  },
} as const;

/**
 * Optimized tutor profile query with all necessary relations
 */
export const tutorProfileWithRelations = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
    },
  },
  availability: {
    where: { isActive: true },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  },
} as const;

/**
 * Batch fetch user data to avoid N+1 queries
 * 
 * @param userIds - Array of user IDs to fetch
 * @returns Map of userId -> user data
 */
export async function batchFetchUsers(
  userIds: string[]
): Promise<Map<string, { id: string; name: string | null; email: string; image: string | null }>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  const userMap = new Map();
  for (const user of users) {
    userMap.set(user.id, user);
  }

  return userMap;
}

/**
 * Batch fetch tutor profiles to avoid N+1 queries
 * 
 * @param tutorIds - Array of tutor profile IDs to fetch
 * @returns Map of tutorId -> tutor profile data
 */
export async function batchFetchTutorProfiles(
  tutorIds: string[]
): Promise<Map<string, { id: string; hourlyRate: number; rating: number; specialties: string[] }>> {
  if (tutorIds.length === 0) {
    return new Map();
  }

  const tutors = await prisma.tutorProfile.findMany({
    where: {
      id: {
        in: tutorIds,
      },
    },
    select: {
      id: true,
      hourlyRate: true,
      rating: true,
      specialties: true,
    },
  });

  const tutorMap = new Map();
  for (const tutor of tutors) {
    tutorMap.set(tutor.id, tutor);
  }

  return tutorMap;
}

/**
 * Get tutor statistics efficiently
 * Returns counts and averages without fetching all data
 */
export async function getTutorStatistics(tutorId: string) {
  const [bookingStats, reviewStats] = await Promise.all([
    // Booking statistics
    prisma.booking.aggregate({
      where: {
        tutorId,
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        price: true,
      },
    }),
    // Review statistics
    prisma.review.aggregate({
      where: {
        tutorId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    totalBookings: bookingStats._count.id,
    totalRevenue: bookingStats._sum.price || 0,
    averageRating: reviewStats._avg.rating || 0,
    totalReviews: reviewStats._count.id,
  };
}
