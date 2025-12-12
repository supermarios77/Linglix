# Linglix

Language learning platform connecting students with expert tutors.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth v5
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

4. Configure your `.env` file with:
   - `DATABASE_URL` - PostgreSQL connection string
   - `DIRECT_URL` - Direct database connection (for migrations)
   - `NEXTAUTH_URL` - Your application URL
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `STRIPE_SECRET_KEY` - Stripe secret key (for payments)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
   - `NEXT_PUBLIC_APP_URL` - Your application URL (for payment redirects)
   - `RESEND_API_KEY` - Resend email API key (for email notifications)
   - `FROM_EMAIL` - Email address to send from (default: onboarding@resend.dev)
   - `FROM_NAME` - Sender name (default: Linglix)
   - `CRON_SECRET` - Secret token for cron job authentication (optional, for manual testing)

5. Set up the database:
```bash
bun run db:push
bun run db:generate
```

6. Run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

See the [docs](./docs/) directory for detailed guides:

- [Database Setup](./docs/DATABASE_SETUP.md)
- [Authentication Setup](./docs/AUTH_SETUP.md)
- [Email Setup](./docs/EMAIL_SETUP.md)
- [Stripe Setup](./docs/STRIPE_SETUP.md)
- [Stream Video Setup](./docs/STREAM_VIDEO_SETUP.md)
- [Cron Jobs Setup](./docs/CRON_SETUP.md)
- [Production Checklist](./docs/PRODUCTION_CHECKLIST.md)
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

## Project Structure

```
linglix/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── prisma/          # Database schema
├── messages/        # i18n translations
├── docs/            # Documentation
└── public/          # Static assets
```

## License

Private project
