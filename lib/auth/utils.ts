import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";

/**
 * Authentication utility functions
 * 
 * These functions handle user registration, password hashing, etc.
 */

// Registration schema validation
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  role: z.enum(["STUDENT", "TUTOR"]).default("STUDENT"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Production: use 12+ rounds
  return bcrypt.hash(password, saltRounds);
}

/**
 * Register a new user with email/password
 * @param data - Registration data
 * @returns Created user (without password)
 * @throws Error if user already exists or validation fails
 */
export async function registerUser(data: RegisterInput) {
  // Validate input
  const validatedData = registerSchema.parse(data);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email.toLowerCase() },
  });

  if (existingUser) {
    const { Errors } = await import("../errors");
    throw Errors.Conflict("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      name: validatedData.name,
      role: validatedData.role as Role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Verify if an email is already registered
 * @param email - Email to check
 * @returns true if email exists, false otherwise
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  return !!user;
}
