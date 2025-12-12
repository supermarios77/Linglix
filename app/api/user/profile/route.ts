import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { z } from "zod";
import { NextResponse } from "next/server";

const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
});

/**
 * Update User Profile API Route
 * 
 * PATCH /api/user/profile
 * 
 * Updates the user's basic profile information (name)
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    const body = await request.json();
    const validated = updateUserProfileSchema.parse(body);

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(Errors.BadRequest(error.errors[0]?.message || "Invalid input"));
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        return createErrorResponse(
          Errors.NotFound("User not found. Please sign in again.")
        );
      }
    }

    return createErrorResponse(
      error,
      "Failed to update profile. Please try again."
    );
  }
}
