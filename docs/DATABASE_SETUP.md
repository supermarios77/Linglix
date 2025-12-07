# Database Setup Guide

This project uses **Neon** (Serverless Postgres) as the database.

## About Neon

Neon is a serverless PostgreSQL database that runs on **AWS** (default) or **Azure**. 

- **AWS Regions**: Default option, connection strings use `*.aws.neon.tech`
- **Azure Regions**: Available as Azure Native Service, connection strings use `*.azure.neon.tech`

You can choose your preferred cloud provider when creating a Neon project. Both offer the same features and performance.

## Getting Started

### 1. Create a Neon Account

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up for a free account
3. Create a new project
4. Choose your region (AWS or Azure)

### 2. Get Your Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details" or "Connection String"
3. Copy the connection string

**AWS Example:**
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Azure Example:**
```
postgresql://user:password@ep-xxx.region.azure.neon.tech/dbname?sslmode=require
```

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

   **Note:** For Neon, `DATABASE_URL` and `DIRECT_URL` can be the same connection string. The `DIRECT_URL` is used for migrations and introspection.

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
bun run db:migrate
```

Or with Prisma CLI directly:
```bash
bunx prisma migrate dev --name init
```

This will:
- Create the database tables
- Generate the Prisma Client
- Create a migration file

### 5. Generate Prisma Client

```bash
bun run db:generate
```

Or:
```bash
bunx prisma generate
```

### 6. (Optional) Open Prisma Studio

To view and edit your database in a GUI:

```bash
bun run db:studio
```

## Database Schema

The schema includes:

- **User** - Students and tutors with authentication
- **TutorProfile** - Additional tutor information
- **Availability** - Tutor weekly schedules
- **Booking** - Scheduled sessions
- **VideoSession** - Actual video call sessions
- **Review** - Student reviews of tutors
- **Account** - NextAuth OAuth accounts
- **AuthSession** - NextAuth sessions
- **VerificationToken** - Email verification tokens

## Production Considerations

### Connection Pooling

Neon provides built-in connection pooling. The Prisma client is configured with:
- Singleton pattern to prevent multiple instances
- Proper connection management for serverless environments
- Error logging in production

### Indexes

The schema includes optimized indexes for:
- User lookups (email, role)
- Booking queries (studentId, tutorId, scheduledAt, status)
- Review queries (tutorId, rating, createdAt)
- Availability queries (tutorId, dayOfWeek)

### Data Types

- Uses `cuid()` for IDs (URL-safe, sortable)
- Proper foreign key constraints with cascade deletes
- Timestamps with `@default(now())` and `@updatedAt`
- Enums for status fields (type-safe)

## Useful Commands

```bash
# Create a new migration
bun run db:migrate

# Apply migrations to production
bunx prisma migrate deploy

# Reset database (development only)
bun run db:reset

# View database in browser
bun run db:studio

# Generate Prisma Client
bun run db:generate

# Format Prisma schema
bunx prisma format

# Validate schema
bunx prisma validate
```

## Neon Free Tier Limits

- **Storage:** 0.5 GB
- **Projects:** 1
- **Branches:** Unlimited
- **Compute:** 0.5 vCPU, 1 GB RAM
- **Connection pooling:** Included

Perfect for MVP development! 🚀

## Scaling

When you need to scale:
- **Paid tier:** $19/month for 10GB storage
- Automatic scaling based on usage
- No connection limits
- Branching for dev/staging/prod environments