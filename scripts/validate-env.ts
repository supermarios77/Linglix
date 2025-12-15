#!/usr/bin/env tsx
/**
 * Environment Variables Validation Script
 * 
 * Validates that all required environment variables are set.
 * Run this before deploying to production.
 * 
 * Usage:
 *   bun run scripts/validate-env.ts
 *   or
 *   tsx scripts/validate-env.ts
 */

import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Load environment variables
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  console.warn("⚠️  .env file not found. Using system environment variables.");
}

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validate?: (value: string | undefined) => boolean | string;
}

const requiredVars: EnvVar[] = [
  {
    name: "NODE_ENV",
    required: true,
    description: "Node environment (development, production, test)",
    validate: (val) => ["development", "production", "test"].includes(val || "") || "Must be development, production, or test",
  },
  {
    name: "DATABASE_URL",
    required: true,
    description: "PostgreSQL database connection string",
    validate: (val) => val?.startsWith("postgresql://") || "Must start with postgresql://",
  },
  {
    name: "DIRECT_URL",
    required: true,
    description: "Direct database connection (for migrations)",
    validate: (val) => val?.startsWith("postgresql://") || "Must start with postgresql://",
  },
  {
    name: "NEXTAUTH_URL",
    required: true,
    description: "Application URL for NextAuth",
    validate: (val) => val?.startsWith("http://") || val?.startsWith("https://") || "Must be a valid URL",
  },
  {
    name: "NEXTAUTH_SECRET",
    required: true,
    description: "NextAuth secret key (generate with: openssl rand -base64 32)",
    validate: (val) => (val?.length || 0) >= 32 || "Must be at least 32 characters",
  },
  {
    name: "STRIPE_SECRET_KEY",
    required: true,
    description: "Stripe secret key",
    validate: (val) => val?.startsWith("sk_") || "Must start with sk_",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    required: true,
    description: "Stripe publishable key",
    validate: (val) => val?.startsWith("pk_") || "Must start with pk_",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: true,
    description: "Stripe webhook signing secret",
    validate: (val) => val?.startsWith("whsec_") || "Must start with whsec_",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: true,
    description: "Application URL",
    validate: (val) => val?.startsWith("http://") || val?.startsWith("https://") || "Must be a valid URL",
  },
  {
    name: "RESEND_API_KEY",
    required: true,
    description: "Resend email API key",
    validate: (val) => val?.startsWith("re_") || "Must start with re_",
  },
  {
    name: "FROM_EMAIL",
    required: false,
    description: "Email sender address (defaults to onboarding@resend.dev)",
  },
  {
    name: "FROM_NAME",
    required: false,
    description: "Email sender name (defaults to Linglix)",
  },
  {
    name: "NEXT_PUBLIC_STREAM_API_KEY",
    required: true,
    description: "Stream Video/Chat API key",
  },
  {
    name: "STREAM_SECRET_KEY",
    required: true,
    description: "Stream Video/Chat secret key",
  },
  {
    name: "UPSTASH_REDIS_REST_URL",
    required: true,
    description: "Upstash Redis REST URL (for rate limiting)",
    validate: (val) => val?.startsWith("https://") || "Must be a valid HTTPS URL",
  },
  {
    name: "UPSTASH_REDIS_REST_TOKEN",
    required: true,
    description: "Upstash Redis REST token (for rate limiting)",
  },
];

const optionalVars: EnvVar[] = [
  {
    name: "NEXT_PUBLIC_SENTRY_DSN",
    required: false,
    description: "Sentry DSN for error tracking",
  },
  {
    name: "SENTRY_DSN",
    required: false,
    description: "Sentry DSN (server-side)",
  },
  {
    name: "SENTRY_ORG",
    required: false,
    description: "Sentry organization slug",
  },
  {
    name: "SENTRY_PROJECT",
    required: false,
    description: "Sentry project slug",
  },
  {
    name: "SENTRY_AUTH_TOKEN",
    required: false,
    description: "Sentry auth token (for source maps)",
  },
  {
    name: "GOOGLE_CLIENT_ID",
    required: false,
    description: "Google OAuth client ID",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    required: false,
    description: "Google OAuth client secret",
  },
  {
    name: "GITHUB_CLIENT_ID",
    required: false,
    description: "GitHub OAuth client ID",
  },
  {
    name: "GITHUB_CLIENT_SECRET",
    required: false,
    description: "GitHub OAuth client secret",
  },
  {
    name: "BLOB_READ_WRITE_TOKEN",
    required: false,
    description: "Vercel Blob storage token",
  },
  {
    name: "CRON_SECRET",
    required: false,
    description: "Cron job authentication secret",
  },
  {
    name: "NEXT_PUBLIC_APP_VERSION",
    required: false,
    description: "Application version (for release tracking)",
  },
];

function validateEnvVar(envVar: EnvVar): { valid: boolean; error?: string } {
  const value = process.env[envVar.name];

  if (envVar.required && !value) {
    return {
      valid: false,
      error: "Missing required environment variable",
    };
  }

  if (value && envVar.validate) {
    const validationResult = envVar.validate(value);
    if (validationResult !== true) {
      return {
        valid: false,
        error: typeof validationResult === "string" ? validationResult : "Validation failed",
      };
    }
  }

  return { valid: true };
}

function main() {
  console.log("🔍 Validating environment variables...\n");

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  console.log("📋 Required Variables:\n");
  for (const envVar of requiredVars) {
    const result = validateEnvVar(envVar);
    const value = process.env[envVar.name];
    const displayValue = value
      ? value.length > 20
        ? `${value.substring(0, 20)}...`
        : value
      : "(not set)";

    if (!result.valid) {
      hasErrors = true;
      console.error(`  ❌ ${envVar.name}`);
      console.error(`     ${result.error}`);
      console.error(`     Current: ${displayValue}`);
      console.error(`     Description: ${envVar.description}\n`);
    } else {
      console.log(`  ✅ ${envVar.name}`);
      console.log(`     ${displayValue}\n`);
    }
  }

  // Check optional variables
  console.log("\n📋 Optional Variables:\n");
  for (const envVar of optionalVars) {
    const value = process.env[envVar.name];
    if (value) {
      const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
      console.log(`  ✅ ${envVar.name} = ${displayValue}`);
    } else {
      console.log(`  ⚪ ${envVar.name} (not set)`);
      if (envVar.name.includes("SENTRY") || envVar.name.includes("OAUTH")) {
        hasWarnings = true;
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (hasErrors) {
    console.error("\n❌ Validation failed! Please fix the errors above.");
    console.error("\n💡 Tip: Copy .env.example to .env and fill in your values.");
    process.exit(1);
  } else if (hasWarnings) {
    console.warn("\n⚠️  Validation passed with warnings.");
    console.warn("Some optional features may not work (Sentry, OAuth, etc.).");
    process.exit(0);
  } else {
    console.log("\n✅ All required environment variables are configured!");
    console.log("\n💡 Next steps:");
    console.log("   1. Run: bun run db:push");
    console.log("   2. Run: bun run db:generate");
    console.log("   3. Run: bun dev");
    process.exit(0);
  }
}

main();
