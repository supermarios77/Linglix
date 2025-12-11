/**
 * Password Reset Utilities
 * 
 * Functions for generating and validating password reset tokens
 */

import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

const RESET_TOKEN_EXPIRY_HOURS = 1; // Token expires in 1 hour

/**
 * Generate a secure random token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a password reset token for a user
 * 
 * @param email - User's email address
 * @returns The reset token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateResetToken();
  const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  
  // Use identifier format: "password-reset:email"
  const identifier = `password-reset:${email.toLowerCase()}`;
  
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: {
      identifier,
    },
  });
  
  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });
  
  return token;
}

/**
 * Verify and consume a password reset token
 * 
 * @param email - User's email address
 * @param token - The reset token
 * @returns true if token is valid, false otherwise
 */
export async function verifyPasswordResetToken(
  email: string,
  token: string
): Promise<boolean> {
  const identifier = `password-reset:${email.toLowerCase()}`;
  
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier,
        token,
      },
    },
  });
  
  if (!verificationToken) {
    return false;
  }
  
  // Check if token has expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier,
          token,
        },
      },
    });
    return false;
  }
  
  // Token is valid - delete it (one-time use)
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier,
        token,
      },
    },
  });
  
  return true;
}
