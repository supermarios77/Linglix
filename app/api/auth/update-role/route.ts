import { NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { Role } from "@prisma/client";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["STUDENT", "TUTOR"]),
});

/**
 * Update User Role API Route
 * 
 * POST /api/auth/update-role
 * 
 * Updates the user's role during onboarding
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return createErrorResponse(Errors.Unauthorized());
    }

    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);

    // Update user role
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: role as Role },
    });

    return NextResponse.json(
      {
        message: "Role updated successfully",
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(Errors.BadRequest("Invalid role"));
    }

    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    return createErrorResponse(
      error,
      "Failed to update role. Please try again."
    );
  }
}

