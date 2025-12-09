# 100ms Video Calling Setup Guide

This project uses **100ms** for video calling functionality.

## Features

- ✅ Server-side token generation (secure)
- ✅ Role-based access (teacher/student)
- ✅ Booking-based video calls
- ✅ Session tracking
- ✅ Production-ready error handling
- ✅ Permission management

## Setup

### 1. Create a 100ms Account

1. Go to [100ms Dashboard](https://dashboard.100ms.live/register)
2. Sign up for an account
3. Create a new app/project
4. Note your **App ID** and **App Secret**

### 2. Create a Room Template

1. In the 100ms Dashboard, go to **Room Templates**
2. Create a new template or use the default
3. Configure roles:
   - **teacher** - For tutors (can publish video/audio)
   - **student** - For students (can publish video/audio)
4. Note the **Template ID** (optional, can use room codes)

### 3. Environment Variables

Add these to your `.env` file:

```env
# 100ms Configuration
HMS100_APP_ID=your-app-id-here
HMS100_APP_SECRET=your-app-secret-here
HMS100_ROOM_ID=optional-room-id (leave empty to auto-generate per booking)
```

**Security**: Never commit these values to version control. Store them securely in your deployment platform.

### 4. Database Migration

The schema includes a `hmsRoomId` field in the `VideoSession` model. Run:

```bash
bun run db:push
```

## Usage

### Joining a Video Call

1. Navigate to a confirmed booking
2. Click on the booking card (if status is CONFIRMED)
3. You'll be redirected to `/video/[bookingId]`
4. The system will:
   - Generate a secure token on the server
   - Join the 100ms room
   - Request camera/microphone permissions
   - Display video streams

### API Endpoints

#### Generate Token
```
POST /api/100ms/token
Body: { bookingId: string }
```

Returns:
```json
{
  "token": "jwt-token",
  "roomId": "booking-xxx",
  "userId": "user-booking",
  "role": "teacher" | "student",
  "appId": "your-app-id"
}
```

#### Start Session
```
POST /api/video-sessions/start
Body: { bookingId: string }
```

#### End Session
```
POST /api/video-sessions/end
Body: { bookingId: string }
```

## Architecture

### Server-Side Token Generation

Tokens are generated on the server using:
- `HMS100_APP_ID` - Your 100ms app ID
- `HMS100_APP_SECRET` - Your 100ms app secret
- `roomId` - Generated from booking ID
- `userId` - Generated from user ID + booking ID
- `role` - "teacher" for tutors, "student" for students

### Client-Side Integration

The `VideoCall` component:
- Uses `@100mslive/react-sdk`
- Wrapped in `HMSRoomProvider`
- Uses hooks: `useHMSActions`, `useHMSStore`
- Handles permissions gracefully
- Cleans up on unmount

## Production Considerations

### Security

- ✅ Tokens generated server-side only
- ✅ Booking access verification
- ✅ Role-based access control
- ✅ Environment variables secured

### Error Handling

- Permission errors with user-friendly messages
- Network errors with retry logic
- Connection state management
- Graceful degradation

### Performance

- Dynamic imports for client-side SDK
- Proper cleanup on unmount
- Efficient video track management
- Connection pooling (handled by 100ms)

## Testing

1. Create a test booking (status: CONFIRMED)
2. Sign in as student
3. Navigate to booking → video call
4. Sign in as tutor (different browser/incognito)
5. Navigate to same booking → video call
6. Both should see each other's video

## Troubleshooting

### Permission Denied

- Check browser settings
- For localhost: Click 'i' icon → Site settings → Allow camera/microphone
- For HTTPS: Click lock icon → Site settings → Allow camera/microphone

### Token Generation Failed

- Verify `HMS100_APP_ID` and `HMS100_APP_SECRET` are set
- Check booking status is CONFIRMED
- Verify user has access to booking

### Connection Issues

- Check network connectivity
- Verify 100ms dashboard shows room is active
- Check browser console for errors

## Resources

- [100ms Documentation](https://www.100ms.live/docs)
- [React SDK Guide](https://www.100ms.live/docs/javascript/v2/quickstart/react-quickstart)
- [Token Generation](https://www.100ms.live/docs/javascript/v2/advanced-features/token-generation)

