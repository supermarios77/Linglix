# Project Structure

This document outlines the organization and structure of the Linglix codebase.

## Directory Structure

```
linglix/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── (auth)/           # Auth pages (to be created)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
│
├── config/                # Configuration files
│   ├── auth.config.ts    # NextAuth configuration (Edge-compatible)
│   └── auth.ts           # NextAuth initialization (Edge-compatible)
│
├── lib/                   # Shared utilities and helpers
│   ├── auth/             # Authentication utilities
│   │   ├── index.ts      # Server-side auth helpers
│   │   └── utils.ts      # Registration & password utilities
│   └── db/               # Database utilities
│       ├── index.ts      # Barrel export
│       └── prisma.ts     # Prisma Client singleton
│
├── types/                 # TypeScript type definitions
│   └── next-auth.d.ts    # NextAuth type extensions
│
├── prisma/                # Prisma ORM
│   └── schema.prisma     # Database schema
│
├── docs/                  # Documentation
│   ├── AUTH_SETUP.md
│   ├── DATABASE_SETUP.md
│   ├── NEXTJS16_ANALYSIS.md
│   ├── PRODUCTION_CHECKLIST.md
│   ├── PROJECT_STRUCTURE.md (this file)
│   └── README.md
│
├── public/                # Static assets
├── proxy.ts               # Next.js 16 proxy (route protection)
├── prisma.config.ts       # Prisma 7+ configuration
└── package.json          # Dependencies
```

## Key Files

### Configuration

- **`config/auth.config.ts`**: NextAuth configuration (Edge Runtime compatible)
- **`config/auth.ts`**: NextAuth initialization for middleware
- **`prisma.config.ts`**: Prisma 7+ database configuration
- **`proxy.ts`**: Route protection and authentication (Next.js 16 proxy)

### Database

- **`lib/db/prisma.ts`**: Prisma Client singleton with PostgreSQL adapter
- **`prisma/schema.prisma`**: Database schema definitions

### Authentication

- **`lib/auth/index.ts`**: Server-side auth utilities (getCurrentUser, requireAuth, etc.)
- **`lib/auth/utils.ts`**: Registration and password hashing utilities
- **`app/api/auth/[...nextauth]/route.ts`**: NextAuth API handlers (Node.js runtime)
- **`app/api/auth/register/route.ts`**: User registration endpoint

### Types

- **`types/next-auth.d.ts`**: TypeScript extensions for NextAuth session/user types

## Architecture Principles

### 1. Separation of Concerns

- **Edge Runtime** (middleware): Uses `config/auth.ts` - no Prisma, no Node.js APIs
- **Node.js Runtime** (API routes): Uses Prisma adapter and database operations
- **Server Components**: Use `lib/auth/index.ts` for auth checks
- **Client Components**: Use NextAuth React hooks

### 2. File Organization

- **`config/`**: Application configuration (auth, etc.)
- **`lib/`**: Reusable utilities organized by domain
- **`app/`**: Next.js App Router pages and API routes
- **`types/`**: TypeScript type definitions
- **`docs/`**: All documentation in one place

### 3. Import Paths

All imports use the `@/` alias configured in `tsconfig.json`:
- `@/config/*` - Configuration files
- `@/lib/*` - Utility functions
- `@/types/*` - Type definitions
- `@/app/*` - App Router files

## Best Practices

### ✅ Do

- Keep Edge Runtime code separate from Node.js code
- Use barrel exports (`index.ts`) for clean imports
- Organize utilities by domain (auth, db, etc.)
- Document complex configurations
- Use TypeScript for type safety

### ❌ Don't

- Import Prisma in Edge Runtime code
- Use Node.js APIs in middleware
- Mix server and client code
- Create circular dependencies
- Duplicate utility functions

## Adding New Features

### Adding a New API Route

1. Create route in `app/api/[route-name]/route.ts`
2. Use `@/lib/db/prisma` for database operations
3. Use `@/lib/auth` for authentication checks
4. Add proper error handling and validation

### Adding a New Utility

1. Determine domain (auth, db, utils, etc.)
2. Create file in appropriate `lib/[domain]/` folder
3. Export from `lib/[domain]/index.ts` if needed
4. Document usage

### Adding a New Page

1. Create in `app/[route-name]/page.tsx`
2. Use Server Components by default
3. Add `'use client'` only if needed
4. Protect with middleware if required

## Migration Notes

### From Previous Structure

- `auth.ts` → `config/auth.ts`
- `auth.config.ts` → `config/auth.config.ts`
- `lib/prisma.ts` → `lib/db/prisma.ts`
- `lib/auth.ts` → `lib/auth/index.ts`
- `lib/auth-utils.ts` → `lib/auth/utils.ts`

All import paths have been updated to reflect the new structure.
