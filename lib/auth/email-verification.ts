/**
 * Email Verification Utilities
 * 
 * Functions for generating and validating email verification tokens
 */

import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24; // Token expires in 24 hours

/**
 * Generate a secure random token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create an email verification token for a user
 * 
 * @param email - User's email address
 * @returns The verification token
 */
export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = generateVerificationToken();
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  
  // Use identifier format: "email-verification:email"
  const identifier = `email-verification:${email.toLowerCase()}`;
  
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
 * Verify and consume an email verification token
 * 
 * @param email - User's email address
 * @param token - The verification token
 * @returns true if token is valid, false otherwise
 */
export async function verifyEmailVerificationToken(
  email: string,
  token: string
): Promise<boolean> {
  const identifier = `email-verification:${email.toLowerCase()}`;
  
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
