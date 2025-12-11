# Stream Video SDK Setup

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stream Video SDK Configuration
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key_here
STREAM_SECRET_KEY=your_stream_secret_key_here
```

### Getting Stream API Credentials

1. Sign up for a Stream account at [https://getstream.io/](https://getstream.io/)
2. Create a new application in the Stream Dashboard
3. Navigate to the API Keys section
4. Copy your:
   - **API Key** → `NEXT_PUBLIC_STREAM_API_KEY`
   - **Secret Key** → `STREAM_SECRET_KEY`

**Important**: 
- The API Key is public and safe to expose in client-side code (it's prefixed with `NEXT_PUBLIC_`)
- The Secret Key must remain private and only used server-side

## Database Migration

After adding the Stream fields to the Booking model, run:

```bash
bun run db:push
# or
bun run db:migrate
```

This will add the following fields to the `Booking` table:
- `callId` - Stream call ID (format: "booking-{bookingId}")
- `recordingUrl` - URL to recording after session
- `callStartedAt` - When call actually started
- `callEndedAt` - When call ended

## Testing

1. Ensure environment variables are set
2. Start the development server: `bun dev`
3. Test token generation: Visit `/api/video/token` (requires authentication)
4. The token endpoint should return a valid Stream token

## Next Steps

- [ ] Create video call page component
- [ ] Integrate Stream Video Provider in layout
- [ ] Add "Join Session" buttons to dashboard
- [ ] Implement call recording functionality
