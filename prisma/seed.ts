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
    // Hash passwords
    const tutorPassword = await bcrypt.hash("Tutor123!", 12);
    const adminPassword = await bcrypt.hash("Admin123!", 12);

    // Check if users already exist
    const existingTutor = await prisma.user.findUnique({
      where: { email: "tutor@linglix.com" },
      include: { tutorProfile: true },
    });

    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@linglix.com" },
    });

    const existingStudent = await prisma.user.findUnique({
      where: { email: "student@linglix.com" },
      include: { studentProfile: true },
    });

    if (existingTutor && existingAdmin && existingStudent) {
      console.log("✅ Users already exist, skipping seed...");
      console.log(`   Tutor Email: ${existingTutor.email}`);
      console.log(`   Admin Email: ${existingAdmin.email}`);
      console.log(`   Student Email: ${existingStudent.email}`);
      return;
    }

    // Create admin, tutor, and student users in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admin user (if doesn't exist)
      let admin = existingAdmin;
      if (!admin) {
        admin = await tx.user.create({
          data: {
            email: "admin@linglix.com",
            name: "Admin",
            password: adminPassword,
            role: "ADMIN",
            emailVerified: new Date(), // Mark as verified for seed data
          },
        });
        console.log("✅ Admin user created!");
      }

      // Create student user (if doesn't exist)
      let student = existingStudent;
      if (!student) {
        const studentPassword = await bcrypt.hash("Student123!", 12);
        student = await tx.user.create({
          data: {
            email: "student@linglix.com",
            name: "Alex",
            password: studentPassword,
            role: "STUDENT",
            emailVerified: new Date(),
            studentProfile: {
              create: {
                learningGoal: "conversation",
                currentLevel: "intermediate",
                preferredSchedule: "evening",
                motivation: "Want to improve my English for work",
              },
            },
          },
        });
        console.log("✅ Student user created!");
      }

      // Create tutor user (if doesn't exist)
      const user = existingTutor || await tx.user.create({
        data: {
          email: "tutor@linglix.com",
          name: "Abby",
          password: tutorPassword,
          role: "TUTOR",
          emailVerified: new Date(), // Mark as verified for seed data
        },
      });

      // Create tutor profile (if doesn't exist)
      const tutorProfile = existingTutor?.tutorProfile || await tx.tutorProfile.create({
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

      // Create availability (if tutor profile was just created)
      if (!existingTutor) {
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
      }

      // Create a test booking if both tutor and student exist
      let testBooking = null;
      if (user && tutorProfile && (student || existingStudent)) {
        const studentUser = student || existingStudent!;
        
        // Check if test booking already exists
        const existingBooking = await tx.booking.findFirst({
          where: {
            studentId: studentUser.id,
            tutorId: tutorProfile.id,
            status: "CONFIRMED",
          },
        });

        if (!existingBooking) {
          testBooking = await tx.booking.create({
            data: {
              studentId: studentUser.id,
              tutorId: tutorProfile.id,
              scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
              duration: 60,
              status: "CONFIRMED",
              price: 50.00,
            },
          });
          console.log("✅ Test booking created!");
        }
      }

      return { admin, user, tutorProfile, student: student || existingStudent, testBooking };
    });

    console.log("✅ Users created successfully!");
    
    if (result.admin && !existingAdmin) {
      console.log("\n👤 Admin Account:");
      console.log(`   Email: ${result.admin.email}`);
      console.log(`   Name: ${result.admin.name}`);
      console.log(`   Role: ${result.admin.role}`);
    }
    
    if (result.user && !existingTutor) {
      console.log("\n👤 Tutor Account:");
      console.log(`   Email: ${result.user.email}`);
      console.log(`   Name: ${result.user.name}`);
      console.log(`   Role: ${result.user.role}`);
      if (result.tutorProfile) {
        console.log(`   Hourly Rate: $${result.tutorProfile.hourlyRate}`);
        console.log(`   Rating: ${result.tutorProfile.rating}`);
        console.log(`   Specialties: ${result.tutorProfile.specialties.join(", ")}`);
        console.log(`   Total Sessions: ${result.tutorProfile.totalSessions}`);
      }
    }

    if (result.student && !existingStudent) {
      console.log("\n👤 Student Account:");
      console.log(`   Email: ${result.student.email}`);
      console.log(`   Name: ${result.student.name}`);
      console.log(`   Role: ${result.student.role}`);
    }

    if (result.testBooking) {
      console.log("\n📅 Test Booking Created:");
      console.log(`   Booking ID: ${result.testBooking.id}`);
      console.log(`   Scheduled: ${result.testBooking.scheduledAt.toLocaleString()}`);
      console.log(`   Duration: ${result.testBooking.duration} minutes`);
      console.log(`   Status: ${result.testBooking.status}`);
    }
    
    console.log("\n📝 Login credentials:");
    if (!existingAdmin) {
      console.log(`   Admin Email: admin@linglix.com`);
      console.log(`   Admin Password: Admin123!`);
    }
    if (!existingTutor) {
      console.log(`   Tutor Email: tutor@linglix.com`);
      console.log(`   Tutor Password: Tutor123!`);
    }
    if (!existingStudent) {
      console.log(`   Student Email: student@linglix.com`);
      console.log(`   Student Password: Student123!`);
    }
    console.log("\n⚠️  Remember to change passwords after first login in production!");

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

