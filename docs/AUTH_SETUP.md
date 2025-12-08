# Authentication Setup Guide

This project uses **NextAuth v5** (Auth.js) for authentication with Prisma adapter.

## Features

- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ JWT session strategy (serverless-compatible)
- ✅ Role-based access control (STUDENT, TUTOR, ADMIN)
- ✅ Protected routes with middleware
- ✅ TypeScript support

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000"  # Production: your domain
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 2. OAuth Provider Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

### 3. Run Database Migration

After adding the password field to the User model, run:

```bash
bun run db:migrate
```

## Usage

### Server Components

```typescript
import { getCurrentUser, requireAuth, requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

// Get current user (returns null if not authenticated)
const user = await getCurrentUser();

// Require authentication (throws if not authenticated)
const user = await requireAuth();

// Require specific role
const tutor = await requireRole(Role.TUTOR);
```

### API Routes

```typescript
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Use session.user
}
```

### Client Components

```typescript
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <button onClick={() => signIn()}>Sign In</button>;
  
  return <div>Hello, {session?.user?.name}</div>;
}
```

### Registration

```typescript
// POST /api/auth/register
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
    role: "STUDENT", // or "TUTOR"
  }),
});
```

## Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Input validation with Zod
- ✅ CSRF protection (built into NextAuth)
- ✅ Secure session cookies
- ✅ Email uniqueness enforcement
- ✅ OAuth account linking prevention
- ✅ Route protection with middleware

## File Structure

```
auth.config.ts          # Auth configuration
auth.ts                 # NextAuth initialization
lib/auth.ts            # Server-side auth utilities
lib/auth-utils.ts      # Registration utilities
middleware.ts          # Route protection
types/next-auth.d.ts   # TypeScript types
app/api/auth/          # Auth API routes
```

## Production Checklist

- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Configure OAuth redirect URIs for production
- [ ] Enable email verification (if needed)
- [ ] Set up rate limiting on auth routes
- [ ] Configure CORS if needed
- [ ] Test all auth flows
- [ ] Monitor auth errors in production
