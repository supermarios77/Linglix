import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth";
import { Role, TutorApprovalStatus } from "@prisma/client";
import { createErrorResponse } from "@/lib/errors";
import * as Sentry from "@sentry/nextjs";

/**
 * API Route: Get All Tutors (Admin)
 * 
 * GET /api/admin/tutors?status=PENDING&page=1&limit=20
 * 
 * Security:
 * - Requires ADMIN role
 * - Supports filtering by approval status
 * - Pagination support
 * 
 * Production considerations:
 * - Proper error handling with Sentry
 * - Efficient queries with proper indexes
 * - Pagination for large datasets
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(Role.ADMIN);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TutorApprovalStatus | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100); // Max 100 per page
    const search = searchParams.get("search") || "";

    // Build where clause
    const where: {
      role: Role;
      tutorProfile: {
        approvalStatus?: TutorApprovalStatus;
        OR?: Array<{
          user: {
            OR: Array<{
              name?: { contains: string; mode: "insensitive" };
              email?: { contains: string; mode: "insensitive" };
            }>;
          };
        }>;
      };
    } = {
      role: Role.TUTOR,
      tutorProfile: {},
    };

    // Add status filter
    if (status) {
      where.tutorProfile.approvalStatus = status;
    }

    // Add search filter
    if (search) {
      where.tutorProfile.OR = [
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Fetch tutors with pagination
    const [tutors, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          tutorProfile: {
            select: {
              id: true,
              specialties: true,
              hourlyRate: true,
              rating: true,
              totalSessions: true,
              approvalStatus: true,
              rejectionReason: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      tutors: tutors.map((tutor) => ({
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        image: tutor.image,
        tutorProfile: tutor.tutorProfile,
        createdAt: tutor.createdAt,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    // Log to Sentry in production
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }

    return createErrorResponse(error, "Failed to fetch tutors");
  }
}

