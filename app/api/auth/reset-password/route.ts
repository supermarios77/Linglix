/**
 * Reset Password API Route
 * 
 * POST /api/auth/reset-password
 * 
 * Resets a user's password using a valid reset token
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { verifyPasswordResetToken } from "@/lib/auth/password-reset";
import { createErrorResponse, Errors } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/reset-password
 * 
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return createErrorResponse(
        Errors.BadRequest(validatedData.error.errors[0]?.message || "Invalid request data")
      );
    }

    const { email, token, password } = validatedData.data;
    const emailLower = email.toLowerCase();

    // Verify token
    const isValidToken = await verifyPasswordResetToken(emailLower, token);
    
    if (!isValidToken) {
      return createErrorResponse(
        Errors.BadRequest("Invalid or expired reset token. Please request a new password reset.")
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return createErrorResponse(
        Errors.NotFound("User not found")
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    logger.info("Password reset successful", {
      userId: user.id,
      email: emailLower,
    });

    return NextResponse.json({
      message: "Password has been reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    logger.error("Failed to reset password", {
      error: error instanceof Error ? error.message : String(error),
    });

    return createErrorResponse(
      error,
      "Failed to reset password. Please try again."
    );
  }
}
