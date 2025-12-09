# Agora Video Calling Testing Guide

This guide will help you test the Agora video calling functionality in your application.

## Prerequisites

1. **Agora Account Setup**
   - Sign up at [https://www.agora.io/](https://www.agora.io/)
   - Create a new project
   - Get your App ID and App Certificate
   - Add to `.env`:
     ```env
     AGORA_APP_ID=your-app-id
     AGORA_APP_CERTIFICATE=your-app-certificate
     ```

2. **Test Users**
   - You'll need at least 2 test accounts:
     - One as a **Student** (STUDENT role)
     - One as a **Tutor** (TUTOR role)

3. **Database Setup**
   - Ensure database is synced: `bun run db:push`
   - Both users should have completed onboarding

## Testing Methods

### Method 1: Using Browser DevTools (Recommended for Quick Testing)

#### Step 1: Create Test Booking via Database

1. **Get User IDs**:
   ```sql
   -- In Prisma Studio or database
   SELECT id, email, role FROM "User";
   ```

2. **Get Tutor Profile ID**:
   ```sql
   SELECT id, "userId" FROM "TutorProfile";
   ```

3. **Create a CONFIRMED Booking**:
   ```sql
   INSERT INTO "Booking" (
     id,
     "studentId",
     "tutorId",
     "scheduledAt",
     duration,
     status,
     price,
     "createdAt",
     "updatedAt"
   ) VALUES (
     'test-booking-123',
     'student-user-id-here',
     'tutor-profile-id-here',
     NOW() + INTERVAL '1 hour',  -- 1 hour from now
     60,  -- 60 minutes
     'CONFIRMED',
     50.00,
     NOW(),
     NOW()
   );
   ```

#### Step 2: Test Video Call

1. **Open two browser windows** (or use incognito mode for second window)
2. **Window 1 - Student**:
   - Sign in as student
   - Navigate to: `http://localhost:3000/en/video/test-booking-123`
   - Allow camera/microphone permissions
3. **Window 2 - Tutor**:
   - Sign in as tutor
   - Navigate to: `http://localhost:3000/en/video/test-booking-123`
   - Allow camera/microphone permissions
4. **Verify**:
   - Both users should see each other's video
   - Audio should work (speak into microphone)
   - Controls should work (mute/unmute, video on/off)
   - End call button works

### Method 2: Using Prisma Studio (Easier)

1. **Start Prisma Studio**:
   ```bash
   bun run db:studio
   ```

2. **Create Test Booking**:
   - Open Prisma Studio in browser (usually `http://localhost:5555`)
   - Go to `Booking` model
   - Click "Add record"
   - Fill in:
     - `studentId`: Select your student user
     - `tutorId`: Select your tutor profile
     - `scheduledAt`: Set to future time (e.g., 1 hour from now)
     - `duration`: 60 (minutes)
     - `status`: `CONFIRMED` (important!)
     - `price`: 50.00
   - Save the booking
   - Copy the booking `id`

3. **Test Video Call**:
   - Use the booking ID in the URL: `/en/video/[bookingId]`
   - Test with both student and tutor accounts

### Method 3: Create Test Script

Create a test script to automate booking creation:

```typescript
// scripts/create-test-booking.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestBooking() {
  // Get first student and tutor
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
  });

  const tutorProfile = await prisma.tutorProfile.findFirst({
    include: { user: true },
  });

  if (!student || !tutorProfile) {
    console.error("Need at least one student and one tutor");
    process.exit(1);
  }

  // Create confirmed booking
  const booking = await prisma.booking.create({
    data: {
      studentId: student.id,
      tutorId: tutorProfile.id,
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      duration: 60,
      status: "CONFIRMED",
      price: 50.00,
    },
  });

  console.log("✅ Test booking created!");
  console.log(`Booking ID: ${booking.id}`);
  console.log(`Student: ${student.email}`);
  console.log(`Tutor: ${tutorProfile.user.email}`);
  console.log(`\nTest URL: http://localhost:3000/en/video/${booking.id}`);
}

createTestBooking()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
bunx tsx scripts/create-test-booking.ts
```

## Testing Scenarios

### ✅ Happy Path

1. **Both users join successfully**
   - Student joins → sees loading → connects
   - Tutor joins → sees loading → connects
   - Both see each other's video
   - Audio works both ways
   - Controls work (mute, video toggle, end call)

### ✅ Error Cases

1. **Unauthorized Access**:
   - Try accessing `/en/video/[bookingId]` with a user not part of the booking
   - Should redirect to dashboard

2. **Unconfirmed Booking**:
   - Create booking with status `PENDING`
   - Try to join video call
   - Should show error: "Booking must be confirmed"

3. **Missing Agora Credentials**:
   - Remove `AGORA_APP_ID` from `.env`
   - Try to join call
   - Should show error about missing credentials

4. **Camera/Microphone Denied**:
   - Deny browser permissions
   - Should show appropriate error message

### ✅ Edge Cases

1. **One user leaves**:
   - One user ends call
   - Other user should see "user left" state
   - Can still end their own call

2. **Network issues**:
   - Disconnect internet temporarily
   - Should handle gracefully with error messages

3. **Multiple sessions**:
   - Create multiple bookings
   - Test joining different sessions
   - Each should be isolated

## API Testing

### Test Token Generation

```bash
# Get auth token first (from browser devtools > Application > Cookies)
curl -X POST http://localhost:3000/api/agora/token \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"bookingId": "test-booking-123"}'
```

Expected response:
```json
{
  "token": "006...",
  "channelName": "booking-test-booking-123",
  "uid": 123456,
  "appId": "your-app-id"
}
```

### Test Start Session

```bash
curl -X POST http://localhost:3000/api/video-sessions/start \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"bookingId": "test-booking-123"}'
```

### Test End Session

```bash
curl -X POST http://localhost:3000/api/video-sessions/end \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"bookingId": "test-booking-123"}'
```

## Browser Console Checks

Open browser DevTools (F12) and check:

1. **No errors in Console tab**
2. **Network tab shows**:
   - `/api/video-sessions/start` → 200 OK
   - `/api/agora/token` → 200 OK
   - Agora SDK loaded successfully

3. **Application tab**:
   - Camera/microphone permissions granted
   - Local storage has session data

## Common Issues & Solutions

### Issue: "Failed to initialize video call"

**Solution**:
- Check `.env` has `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`
- Verify booking status is `CONFIRMED`
- Check browser console for detailed error

### Issue: "Camera/Microphone not working"

**Solution**:
- Check browser permissions (Settings > Privacy)
- Ensure no other app is using camera/mic
- Try different browser (Chrome recommended)

### Issue: "Can't see other user"

**Solution**:
- Both users must join the same channel
- Check network connection
- Verify both have granted camera permissions
- Check browser console for Agora errors

### Issue: "Unauthorized" error

**Solution**:
- Verify user is either the student or tutor for the booking
- Check booking exists in database
- Ensure user is authenticated

## Quick Test Checklist

- [ ] Agora credentials in `.env`
- [ ] Database synced (`bun run db:push`)
- [ ] Test booking created with `CONFIRMED` status
- [ ] Two test accounts (student + tutor)
- [ ] Both users can access `/en/video/[bookingId]`
- [ ] Camera/microphone permissions granted
- [ ] Video streams work both ways
- [ ] Audio works both ways
- [ ] Controls work (mute, video toggle, end call)
- [ ] Session ends properly
- [ ] Database records session duration

## Production Testing

Before deploying:

1. **Test with real Agora production credentials**
2. **Test with different browsers** (Chrome, Firefox, Safari, Edge)
3. **Test on mobile devices** (if supported)
4. **Test with poor network conditions**
5. **Test with multiple concurrent sessions**
6. **Monitor Agora dashboard** for usage and errors
7. **Check database** for proper session tracking

## Need Help?

- Check browser console for errors
- Check server logs for API errors
- Verify Agora credentials are correct
- Ensure booking is in `CONFIRMED` status
- Review `docs/AGORA_SETUP.md` for setup details

