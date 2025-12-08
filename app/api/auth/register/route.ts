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
    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.message },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
