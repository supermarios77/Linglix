# Linglix

Language learning platform connecting students with expert tutors.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth v4
- **Payments**: Stripe (Checkout Sessions)
- **Video Chat**: Stream Video SDK
- **Chat**: Stream Chat SDK
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Error Tracking**: Sentry
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd linglix
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with all required variables (see `.env.example` for complete list)

5. Validate your environment configuration:
```bash
bun run validate:env
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `DIRECT_URL` - Direct database connection (for migrations)
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - Stripe secret key (for payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_APP_URL` - Your application URL
- `RESEND_API_KEY` - Resend email API key
- `NEXT_PUBLIC_STREAM_API_KEY` - Stream Video/Chat API key
- `STREAM_SECRET_KEY` - Stream Video/Chat secret key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL (for rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

See `.env.example` for complete reference of all required environment variables.

6. Set up the database:
```bash
bun run db:push
bun run db:generate
```

7. Run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

- [Security Guidelines](./SECURITY.md)

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun run db:generate` - Generate Prisma Client
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Create and apply migrations
- `bun run db:studio` - Open Prisma Studio
- `bun run db:seed` - Seed database with test data
- `bun run validate:env` - Validate environment variables

## Project Structure

```
linglix/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── prisma/          # Database schema
├── messages/        # i18n translations
└── public/          # Static assets
```

## License

Private project
