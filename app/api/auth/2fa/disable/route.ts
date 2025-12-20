/**
 * 2FA Disable API Route
 * 
 * POST /api/auth/2fa/disable
 * 
 * Disables 2FA for an admin account
 * Requires password verification for security
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { createValidationErrorResponse } from "@/lib/errors/validation";
import { Role } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const disable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, "GENERAL");
    if (!rateLimit.success) {
      return createRateLimitResponse(rateLimit.limit!, rateLimit.reset!);
    }

    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(Errors.Unauthorized());
    }

    // Only admins can disable 2FA
    if (session.user.role !== Role.ADMIN) {
      return createErrorResponse(
        Errors.Forbidden("Only admin accounts can disable 2FA")
      );
    }

    const body = await request.json();
    const validationResult = disable2FASchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(createValidationErrorResponse(validationResult.error));
    }

    const { password } = validationResult.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, role: true, twoFactorEnabled: true },
    });

    if (!user || user.role !== Role.ADMIN) {
      return createErrorResponse(Errors.NotFound("User not found"));
    }

    // Verify password
    if (!user.password) {
      return createErrorResponse(
        Errors.BadRequest("Password verification required. Please set a password first.")
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return createErrorResponse(
        Errors.Unauthorized("Invalid password. Please try again.")
      );
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      },
    });

    return NextResponse.json({
      message: "2FA has been disabled successfully",
    });
  } catch (error) {
    return createErrorResponse(
      error,
      "Failed to disable 2FA. Please try again."
    );
  }
}
