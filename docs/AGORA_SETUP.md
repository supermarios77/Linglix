# Agora Video Calling Setup Guide

This project uses **Agora** for production-ready video calling functionality with role-based access control.

## Features

- ✅ Secure token generation (server-side)
- ✅ Role-based access (tutor/student)
- ✅ Audio/video controls
- ✅ Connection state management
- ✅ Proper error handling and cleanup
- ✅ Session tracking in database
- ✅ Responsive design

## Setup

### 1. Create Agora Account

1. Go to [https://www.agora.io/](https://www.agora.io/)
2. Sign up for a free account
3. Create a new project
4. Get your **App ID** and **App Certificate**

### 2. Environment Variables

Add these to your `.env` file:

```env
# Agora Video Calling
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate
```

**Important**: Never commit these credentials to version control. They are sensitive and should only be in environment variables.

### 3. Database Migration

Run the migration to add Agora fields to the VideoSession model:

```bash
bun run db:migrate
```

This adds:
- `agoraChannel` - Agora channel name for the session
- `agoraUid` - Agora user ID for the session

## Usage

### Starting a Video Call

1. Navigate to a confirmed booking
2. Click "Join Video Call" button
3. Allow camera and microphone permissions
4. The call will automatically connect

### Video Call Features

- **Audio/Video Toggle**: Click the microphone/camera buttons to mute/unmute
- **End Call**: Click the red phone button to end the call
- **Automatic Cleanup**: Resources are properly cleaned up when leaving

### API Endpoints

#### Generate Token
```
POST /api/agora/token
Body: { bookingId: string }
Returns: { token, channelName, uid, appId }
```

#### Start Session
```
POST /api/video-sessions/start
Body: { bookingId: string }
Creates/updates video session record
```

#### End Session
```
POST /api/video-sessions/end
Body: { bookingId: string }
Updates session with end time and duration
```

## Security

### Token Generation

- Tokens are generated **server-side only** to prevent exposing app certificates
- Tokens expire after 1 hour for security
- Tokens are validated against booking access (only student/tutor can join)

### Access Control

- Only confirmed bookings can start video calls
- Users can only join calls for bookings they're part of
- Role-based permissions ensure proper access

## Troubleshooting

### "Failed to initialize video call"

1. Check that `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` are set
2. Verify booking is in `CONFIRMED` status
3. Check browser console for detailed errors
4. Ensure camera/microphone permissions are granted

### "Connection Error"

1. Check internet connection
2. Verify Agora credentials are correct
3. Check that booking exists and user has access
4. Try refreshing the page

### Camera/Microphone Not Working

1. Check browser permissions (Settings > Privacy > Camera/Microphone)
2. Ensure no other application is using the camera/microphone
3. Try a different browser
4. Check browser console for permission errors

## Production Considerations

### Performance

- Agora SDK is loaded dynamically (client-side only)
- Proper cleanup prevents memory leaks
- Connection pooling handled by Agora

### Monitoring

- All video session events are logged
- Errors are tracked in Sentry (production)
- Session duration is tracked in database

### Scaling

- Agora handles scaling automatically
- No server infrastructure needed for video calls
- Token generation is stateless and scalable

## Resources

- [Agora Documentation](https://docs.agora.io/)
- [Agora Web SDK](https://docs.agora.io/en/video-calling/get-started/get-started-sdk?platform=web)
- [Agora Token Guide](https://docs.agora.io/en/video-calling/develop/integrate-token-generation)

