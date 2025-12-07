# Database Setup Guide

This project uses **Neon** (Serverless Postgres) as the database.

## Getting Started

### 1. Create a Neon Account

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up for a free account
3. Create a new project

### 2. Get Your Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details" or "Connection String"
3. Copy the connection string (it looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```

   **Note:** For Neon, `DATABASE_URL` and `DIRECT_URL` can be the same connection string.

3. Generate a NextAuth secret:
   ```bash
   openssl rand -base64 32
   ```
   
   Add it to `.env`:
   ```env
   NEXTAUTH_SECRET="your-generated-secret-here"
   ```

### 4. Run Database Migrations

```bash
bunx prisma migrate dev --name init
```

This will:
- Create the database tables
- Generate the Prisma Client
- Create a migration file

### 5. Generate Prisma Client

```bash
bunx prisma generate
```

### 6. (Optional) Open Prisma Studio

To view and edit your database in a GUI:

```bash
bunx prisma studio
```

## Database Schema

The schema includes:

- **User** - Students and tutors
- **TutorProfile** - Additional tutor information
- **Availability** - Tutor weekly schedules
- **Booking** - Scheduled sessions
- **VideoSession** - Actual video call sessions
- **Review** - Student reviews of tutors
- **Account** - NextAuth OAuth accounts
- **AuthSession** - NextAuth sessions
- **VerificationToken** - Email verification tokens

## Useful Commands

```bash
# Create a new migration
bunx prisma migrate dev --name migration_name

# Apply migrations to production
bunx prisma migrate deploy

# Reset database (development only)
bunx prisma migrate reset

# View database in browser
bunx prisma studio

# Generate Prisma Client
bunx prisma generate

# Format Prisma schema
bunx prisma format
```

## Neon Free Tier Limits

- **Storage:** 0.5 GB
- **Projects:** 1
- **Branches:** Unlimited
- **Compute:** 0.5 vCPU, 1 GB RAM

Perfect for MVP development! 🚀
