/**
 * Test Booking Creation Script
 * 
 * Creates a test booking for video call testing.
 * Run with: bunx tsx scripts/create-test-booking.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestBooking() {
  try {
    // Get first student
    const student = await prisma.user.findFirst({
      where: { role: "STUDENT" },
      include: { studentProfile: true },
    });

    // Get first tutor
    const tutorProfile = await prisma.tutorProfile.findFirst({
      include: { user: true },
    });

    if (!student) {
      console.error("❌ No student found. Please create a student account first.");
      console.log("   You can sign up at: http://localhost:3000/en/auth/signup");
      process.exit(1);
    }

    if (!tutorProfile) {
      console.error("❌ No tutor found. Please create a tutor account first.");
      console.log("   You can sign up at: http://localhost:3000/en/auth/signup");
      process.exit(1);
    }

    // Check if tutor is approved
    if (tutorProfile.approvalStatus !== "APPROVED") {
      console.warn("⚠️  Tutor is not approved. Booking will be created but video calls require CONFIRMED status.");
      console.log("   You may need to approve the tutor first or manually set booking status to CONFIRMED.");
    }

    // Create confirmed booking (1 hour from now)
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        tutorId: tutorProfile.id,
        scheduledAt,
        duration: 60, // 60 minutes
        status: "CONFIRMED", // Important: must be CONFIRMED for video calls
        price: 50.00,
      },
    });

    console.log("\n✅ Test booking created successfully!\n");
    console.log("📋 Booking Details:");
    console.log(`   ID: ${booking.id}`);
    console.log(`   Student: ${student.email} (${student.name || "No name"})`);
    console.log(`   Tutor: ${tutorProfile.user.email} (${tutorProfile.user.name || "No name"})`);
    console.log(`   Scheduled: ${scheduledAt.toLocaleString()}`);
    console.log(`   Duration: ${booking.duration} minutes`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Price: $${booking.price.toFixed(2)}\n`);

    console.log("🎥 Test Video Call:");
    console.log(`   Student URL: http://localhost:3000/en/video/${booking.id}`);
    console.log(`   Tutor URL: http://localhost:3000/en/video/${booking.id}\n`);

    console.log("📝 Instructions:");
    console.log("   1. Open two browser windows (or use incognito for one)");
    console.log("   2. Sign in as student in one window");
    console.log("   3. Sign in as tutor in the other window");
    console.log("   4. Navigate to the URL above in both windows");
    console.log("   5. Allow camera/microphone permissions");
    console.log("   6. You should see each other's video!\n");
  } catch (error) {
    console.error("❌ Error creating test booking:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBooking();

