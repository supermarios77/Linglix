/**
 * Create Test Booking Script
 * 
 * Creates a test booking that can be joined immediately for video call testing.
 * 
 * Usage:
 *   bunx tsx scripts/create-test-booking.ts [userEmail]
 * 
 * If no email is provided, it will use the first available student and tutor.
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

// Load environment variables
config({ path: [".env.local", ".env"] });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function createTestBooking(userEmail?: string) {
  try {
    console.log("🔧 Creating test booking for video call testing...\n");

    // Find or use provided user
    let student;
    if (userEmail) {
      student = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { studentProfile: true },
      });

      if (!student) {
        console.error(`❌ User with email ${userEmail} not found`);
        process.exit(1);
      }

      if (student.role !== "STUDENT") {
        console.error(`❌ User ${userEmail} is not a student`);
        process.exit(1);
      }
    } else {
      // Find first student
      student = await prisma.user.findFirst({
        where: { role: "STUDENT" },
        include: { studentProfile: true },
      });

      if (!student) {
        console.error("❌ No student found. Please create a student account first.");
        process.exit(1);
      }
    }

    // Find first approved tutor
    const tutorProfile = await prisma.tutorProfile.findFirst({
      where: {
        isActive: true,
        approvalStatus: "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!tutorProfile) {
      console.error("❌ No approved tutor found. Please create a tutor profile first.");
      process.exit(1);
    }

    // Create booking scheduled for 2 minutes from now (so it's immediately joinable)
    // The canJoinSession function allows joining 5 minutes before scheduled time
    const scheduledAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Delete any old test bookings for this student-tutor pair to avoid clutter
    await prisma.booking.deleteMany({
      where: {
        studentId: student.id,
        tutorId: tutorProfile.id,
        status: "CONFIRMED",
        scheduledAt: {
          lt: new Date(), // Past bookings
        },
      },
    });

    // Create the test booking
    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        tutorId: tutorProfile.id,
        scheduledAt,
        duration: 60, // 60 minutes
        status: "CONFIRMED",
        price: tutorProfile.hourlyRate,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log("✅ Test booking created successfully!\n");
    console.log("📅 Booking Details:");
    console.log(`   Booking ID: ${booking.id}`);
    console.log(`   Scheduled: ${booking.scheduledAt.toLocaleString()}`);
    console.log(`   Duration: ${booking.duration} minutes`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Price: $${booking.price}`);
    console.log(`\n👤 Participants:`);
    console.log(`   Student: ${booking.student.name} (${booking.student.email})`);
    console.log(`   Tutor: ${booking.tutor.user.name} (${booking.tutor.user.email})`);
    console.log(`\n🔗 Join URL: /sessions/${booking.id}`);
    console.log(`\n💡 Note: You can join this session immediately (5 minutes before scheduled time is allowed)`);
  } catch (error) {
    console.error("❌ Error creating test booking:", error);
    throw error;
  }
}

// Get user email from command line args
const userEmail = process.argv[2];

createTestBooking(userEmail)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Script failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
