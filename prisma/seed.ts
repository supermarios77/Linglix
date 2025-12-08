import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

/**
 * Load environment variables
 * Production-ready: loads from .env.local, .env, or system environment
 */
config({ path: [".env.local", ".env"] });

/**
 * Prisma Client for seed script
 * 
 * Prisma 7+ requires adapter for PostgreSQL
 * Load DATABASE_URL from environment
 */
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Make sure .env file exists with DATABASE_URL.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

/**
 * Database Seed Script
 * 
 * Production-ready seed script that:
 * - Creates a sample tutor with complete profile
 * - Uses proper password hashing
 * - Is idempotent (safe to run multiple times)
 * - Handles errors gracefully
 * - Uses transactions for data integrity
 */

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Hash password for tutor
    const hashedPassword = await bcrypt.hash("Tutor123!", 12);

    // Check if tutor already exists
    const existingTutor = await prisma.user.findUnique({
      where: { email: "tutor@linglix.com" },
      include: { tutorProfile: true },
    });

    if (existingTutor) {
      console.log("✅ Tutor already exists, skipping seed...");
      console.log(`   Email: ${existingTutor.email}`);
      console.log(`   Name: ${existingTutor.name}`);
      return;
    }

    // Create tutor user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: "tutor@linglix.com",
          name: "Abby",
          password: hashedPassword,
          role: "TUTOR",
          emailVerified: new Date(), // Mark as verified for seed data
        },
      });

      // Create tutor profile
      const tutorProfile = await tx.tutorProfile.create({
        data: {
          userId: user.id,
          bio: "Experienced English tutor with 10+ years of teaching experience. Specialized in conversational English, business English, and exam preparation. Native speaker from UK.",
          specialties: ["English", "Business English", "Conversational English"],
          hourlyRate: 35.0,
          rating: 4.9,
          totalSessions: 247,
          isActive: true,
          approvalStatus: "APPROVED", // Pre-approved for seed data
        },
      });

      // Create availability (Monday to Friday, 9 AM - 6 PM UTC)
      const availabilityData = [
        { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }, // Monday
        { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" }, // Tuesday
        { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" }, // Wednesday
        { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" }, // Thursday
        { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" }, // Friday
      ];

      await tx.availability.createMany({
        data: availabilityData.map((avail) => ({
          tutorId: tutorProfile.id,
          ...avail,
          timezone: "UTC",
          isActive: true,
        })),
      });

      return { user, tutorProfile };
    });

    console.log("✅ Tutor created successfully!");
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Name: ${result.user.name}`);
    console.log(`   Role: ${result.user.role}`);
    console.log(`   Hourly Rate: $${result.tutorProfile.hourlyRate}`);
    console.log(`   Rating: ${result.tutorProfile.rating}`);
    console.log(`   Specialties: ${result.tutorProfile.specialties.join(", ")}`);
    console.log(`   Total Sessions: ${result.tutorProfile.totalSessions}`);
    console.log("\n📝 Login credentials:");
    console.log(`   Email: tutor@linglix.com`);
    console.log(`   Password: Tutor123!`);
    console.log("\n⚠️  Remember to change the password after first login in production!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

