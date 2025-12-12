import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { z } from "zod";
import { NextResponse } from "next/server";

const updateImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
});

/**
 * Update User Image API Route
 * 
 * PATCH /api/user/image
 * 
 * Updates the user's profile picture URL in the database
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    const body = await request.json();
    const { imageUrl } = updateImageSchema.parse(body);

    // Update user image
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json(
      {
        message: "Profile picture updated successfully",
        imageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(Errors.BadRequest("Invalid image URL"));
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
      "Failed to update profile picture. Please try again."
    );
  }
}
