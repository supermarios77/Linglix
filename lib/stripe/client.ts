/**
 * Stripe Client Utility
 * 
 * Production-ready Stripe client initialization with proper error handling.
 * Follows Stripe best practices for Next.js integration.
 */

import Stripe from "stripe";
import { logger } from "@/lib/logger";

// Validate Stripe secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey || !stripeSecretKey.trim()) {
  logger.warn("STRIPE_SECRET_KEY is not set. Payment functionality will be disabled.");
}

/**
 * Initialize Stripe client
 * Returns null if Stripe is not configured (allows app to work without payments)
 */
export function getStripeClient(): Stripe | null {
  if (!stripeSecretKey || !stripeSecretKey.trim()) {
    return null;
  }

  try {
    return new Stripe(stripeSecretKey.trim(), {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  } catch (error) {
    logger.error("Failed to initialize Stripe client", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Get Stripe publishable key
 */
export function getStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return key?.trim() || null;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    stripeSecretKey?.trim() &&
    getStripePublishableKey()
  );
}
