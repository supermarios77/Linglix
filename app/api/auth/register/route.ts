import { NextResponse } from "next/server";
import { registerUser, registerSchema } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/prisma";

/**
 * User Registration API Route
 * 
 * POST /api/auth/register
 * 
 * Registers a new user with email/password
 * 
 * Production considerations:
 * - Input validation with Zod
 * - Password hashing with bcrypt
 * - Email uniqueness check
 * - Error handling
 * - Rate limiting should be added at edge level
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Register user
    const user = await registerUser(validatedData);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors - don't leak validation details
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input. Please check your email and password." },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint errors (email already exists)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Log error server-side only (not exposed to client)
    if (process.env.NODE_ENV === "development") {
      console.error("Registration error:", error);
    } else {
      // In production, log to error tracking service (e.g., Sentry)
      // console.error should be replaced with proper error tracking
    }

    // Generic error message - don't leak internal details
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}
