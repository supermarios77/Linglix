import { NextResponse } from "next/server";
import { registerUser, registerSchema } from "@/lib/auth/utils";
import { prisma } from "@/lib/db/prisma";
import { createErrorResponse, Errors } from "@/lib/errors";

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
  let body: unknown = null;
  
  try {
    body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw Errors.Conflict("User with this email already exists");
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
      return createErrorResponse(
        Errors.BadRequest("Invalid input. Please check your email and password.")
      );
    }

    // Handle Prisma unique constraint errors (email already exists)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return createErrorResponse(
        Errors.Conflict("User with this email already exists")
      );
    }

    // Handle HttpError (from requireAuth, etc.)
    if (error instanceof Error && error.name === "HttpError") {
      return createErrorResponse(error);
    }

    // Log error to Sentry in production
    if (process.env.NODE_ENV === "production") {
      const { captureException } = await import("@sentry/nextjs");
      captureException(error, {
        tags: {
          route: "/api/auth/register",
          method: "POST",
        },
        extra: {
          hasEmail: body && typeof body === "object" && "email" in body ? "***" : undefined, // Don't log actual email
        },
      });
    } else {
      // In development, log to console; in production, Sentry handles it
      if (process.env.NODE_ENV === "development") {
        console.error("Registration error:", error);
      }
    }

    // Generic error message - don't leak internal details
    return createErrorResponse(
      error,
      "Failed to register user. Please try again."
    );
  }
}
