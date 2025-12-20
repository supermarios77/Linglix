/**
 * 2FA Check API Route
 * 
 * GET /api/auth/2fa/check
 * 
 * Checks if 2FA is required for the current user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/config/auth";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";
import { is2FARequired } from "@/lib/auth/two-factor";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ required: false });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ required: false });
    }

    const required = is2FARequired(user.role, user.twoFactorEnabled);

    return NextResponse.json({
      required,
      enabled: user.twoFactorEnabled,
      role: user.role,
    });
  } catch (error) {
    return createErrorResponse(
      error,
      "Failed to check 2FA status."
    );
  }
}
