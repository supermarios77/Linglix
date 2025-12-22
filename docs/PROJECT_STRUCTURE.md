# Project Structure

This document outlines the organized structure of the Linglix codebase following Next.js 16 App Router best practices and domain-driven design principles.

## Directory Organization

```
linglix/
├── app/                          # Next.js App Router (pages and API routes)
│   ├── [locale]/                 # Locale-specific routes
│   │   ├── admin/                # Admin dashboard pages
│   │   ├── auth/                 # Authentication pages
│   │   ├── dashboard/            # User dashboard pages
│   │   ├── onboarding/           # Onboarding flow
│   │   ├── payments/             # Payment success/cancel pages
│   │   ├── profile/              # User profile pages
│   │   ├── sessions/             # Video session pages
│   │   └── tutors/               # Tutor listing and detail pages
│   ├── api/                      # API route handlers
│   │   ├── admin/                # Admin API endpoints
│   │   ├── appeals/              # Cancellation appeals
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── bookings/             # Booking management
│   │   ├── cron/                 # Scheduled tasks
│   │   ├── onboarding/           # Onboarding endpoints
│   │   ├── payments/             # Payment processing
│   │   ├── tutor/                # Tutor-specific endpoints
│   │   ├── tutors/               # Tutor listing endpoints
│   │   ├── upload/               # File upload endpoints
│   │   ├── user/                 # User management endpoints
│   │   └── video/                # Video call token generation
│   ├── favicon.ico
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── robots.ts                 # Robots.txt generator
│   └── sitemap.ts                # Sitemap generator
│
├── components/                   # React components
│   ├── admin/                    # Admin dashboard components
│   ├── auth/                     # Authentication forms
│   ├── booking/                  # Booking-related components
│   ├── chat/                     # Chat components (Stream Chat)
│   ├── dashboard/                # Dashboard components
│   ├── landing/                  # Landing page components
│   ├── navigation/               # Navigation components
│   ├── onboarding/               # Onboarding components
│   ├── payment/                  # Payment components
│   ├── profile/                  # Profile components
│   ├── tutors/                   # Tutor-related components
│   ├── ui/                       # Reusable UI components (shadcn/ui)
│   ├── video/                    # Video call components (Stream Video)
│   ├── ErrorBoundary.tsx
│   ├── LanguageSwitcher.tsx
│   └── ThemeSwitcher.tsx
│
├── config/                       # Configuration files (centralized)
│   ├── auth.config.ts            # NextAuth configuration
│   ├── auth.ts                   # Auth utilities
│   ├── database/                 # Database configuration
│   │   └── prisma.config.ts      # Prisma configuration
│   ├── i18n/                     # Internationalization config
│   │   ├── config.ts             # Locale configuration
│   │   └── request.ts            # Next-intl request config
│   └── sentry/                   # Sentry monitoring config
│       ├── client.config.ts
│       ├── edge.config.ts
│       └── server.config.ts
│
├── docs/                         # Documentation
│   ├── ERROR_HANDLING.md
│   ├── PROJECT_STRUCTURE.md      # This file
│   ├── SEO_AEO_STRATEGY.md
│   ├── SECURITY.md
│   └── SECURITY_AUDIT.md
│
├── lib/                          # Business logic and utilities
│   ├── auth/                     # Authentication utilities
│   ├── booking/                  # Booking logic
│   ├── cache/                    # Caching utilities (Redis)
│   ├── db/                       # Database utilities
│   ├── email/                    # Email sending (Resend)
│   ├── errors/                   # Error handling
│   ├── hooks/                    # Custom React hooks
│   ├── monitoring/               # Monitoring utilities (Sentry)
│   ├── rate-limit.ts             # Rate limiting
│   ├── seo/                      # SEO utilities
│   ├── stripe/                   # Stripe integration
│   ├── utils/                    # General utilities
│   ├── errors.ts                 # Error definitions
│   └── logger.ts                 # Logging utilities
│
├── messages/                     # i18n translation files
│   ├── en.json                   # English translations
│   └── es.json                   # Spanish translations
│
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema
│   └── seed.ts                   # Database seeding
│
├── public/                       # Static assets
│
├── scripts/                      # Utility scripts
│   ├── create-test-booking.ts
│   └── validate-env.ts
│
├── tests/                        # Test files
│   ├── api/                      # API route tests
│   ├── utils/                    # Test utilities
│   ├── README.md
│   └── setup.ts
│
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts
│
├── proxy.ts                      # Next.js middleware (auth + i18n)
├── instrumentation.ts            # Next.js instrumentation (Sentry)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest configuration
├── vercel.json                   # Vercel deployment config
└── package.json                  # Dependencies and scripts
```

## Key Organizational Principles

### 1. **Feature-Based Organization**
- Components are organized by feature/domain (auth, booking, tutors, etc.)
- API routes mirror the component structure for consistency
- Related functionality is grouped together

### 2. **Centralized Configuration**
- All configuration files are in `/config` directory
- Subdirectories organize config by domain (auth, database, i18n, sentry)
- Makes it easy to find and manage configuration

### 3. **Separation of Concerns**
- `/app` - Routes and pages (Next.js App Router)
- `/components` - UI components
- `/lib` - Business logic and utilities
- `/config` - Configuration files
- `/docs` - Documentation

### 4. **Clear Naming Conventions**
- Components use PascalCase (e.g., `UserDashboardClient.tsx`)
- Utilities use camelCase (e.g., `slug.ts`, `url.ts`)
- Config files use kebab-case (e.g., `auth.config.ts`)
- API routes follow REST conventions

### 5. **Domain-Driven Design**
- Business logic is organized by domain (auth, booking, payments, tutors)
- Each domain has its own utilities, components, and API routes
- Clear boundaries between different parts of the application

## File Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **API Routes**: `route.ts` (Next.js convention)
- **Components**: `ComponentName.tsx` (PascalCase)
- **Utilities**: `utility-name.ts` (kebab-case)
- **Config**: `config-name.config.ts` (kebab-case with .config suffix)
- **Types**: `types-name.d.ts` (kebab-case with .d.ts suffix)

## Import Paths

All imports use the `@/` alias which points to the project root:
- `@/components` - UI components
- `@/lib` - Business logic and utilities
- `@/config` - Configuration files
- `@/app` - App router pages and API routes
- `@/types` - Type definitions
- `@/messages` - Translation files

## Best Practices

1. **Keep related files together** - Group by feature/domain
2. **Use consistent naming** - Follow established conventions
3. **Separate concerns** - Keep UI, logic, and config separate
4. **Document structure** - Update this file when structure changes
5. **Maintain organization** - Don't let files accumulate in root directory

