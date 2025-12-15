# Database Query Optimization Guide

Complete guide for optimizing database queries and preventing N+1 query problems in Linglix.

## Overview

This guide covers:
- Identifying N+1 query problems
- Optimizing queries with Prisma
- Using batch operations
- Query performance best practices

## N+1 Query Problem

### What is N+1?

N+1 queries occur when you:
1. Fetch a list of items (1 query)
2. For each item, fetch related data (N queries)

**Example (BAD):**
```typescript
// 1 query to get bookings
const bookings = await prisma.booking.findMany();

// N queries (one per booking) to get student data
for (const booking of bookings) {
  const student = await prisma.user.findUnique({
    where: { id: booking.studentId }
  });
}
```

**Example (GOOD):**
```typescript
// 1 query to get bookings with students
const bookings = await prisma.booking.findMany({
  include: {
    student: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});
```

## Optimization Strategies

### 1. Use `include` for Relations

Always use `include` to fetch related data in a single query:

```typescript
// ✅ GOOD: Single query with relations
const bookings = await prisma.booking.findMany({
  include: {
    student: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    tutor: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
});

// ❌ BAD: Multiple queries
const bookings = await prisma.booking.findMany();
for (const booking of bookings) {
  const student = await prisma.user.findUnique({
    where: { id: booking.studentId }
  });
}
```

### 2. Use `select` to Limit Fields

Only fetch fields you actually need:

```typescript
// ✅ GOOD: Only fetch needed fields
const bookings = await prisma.booking.findMany({
  select: {
    id: true,
    scheduledAt: true,
    duration: true,
    student: {
      select: {
        name: true,
        email: true,
      },
    },
  },
});

// ❌ BAD: Fetches all fields (wasteful)
const bookings = await prisma.booking.findMany({
  include: {
    student: true, // Fetches all user fields
  },
});
```

### 3. Use Batch Operations

When you need to fetch multiple items by ID, use `findMany` with `in`:

```typescript
// ✅ GOOD: Single query for multiple users
const userIds = bookings.map(b => b.studentId);
const students = await prisma.user.findMany({
  where: {
    id: { in: userIds },
  },
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ❌ BAD: N queries
for (const booking of bookings) {
  const student = await prisma.user.findUnique({
    where: { id: booking.studentId }
  });
}
```

### 4. Use Aggregations Instead of Fetching All Data

For statistics, use `aggregate` instead of fetching all records:

```typescript
// ✅ GOOD: Single aggregation query
const stats = await prisma.booking.aggregate({
  where: { tutorId },
  _count: { id: true },
  _sum: { price: true },
  _avg: { price: true },
});

// ❌ BAD: Fetch all bookings then calculate
const bookings = await prisma.booking.findMany({
  where: { tutorId },
});
const total = bookings.length;
const revenue = bookings.reduce((sum, b) => sum + b.price, 0);
```

### 5. Use Raw Queries for Complex Operations

For operations like getting distinct values, use raw queries:

```typescript
// ✅ GOOD: Optimized raw query
const specialties = await prisma.$queryRaw<Array<{ specialty: string }>>(
  Prisma.sql`
    SELECT DISTINCT unnest(specialties) as specialty
    FROM "TutorProfile"
    WHERE "isActive" = true
    ORDER BY specialty
  `
);

// ❌ BAD: Fetch all tutors just to extract specialties
const tutors = await prisma.user.findMany({
  include: { tutorProfile: { select: { specialties: true } } },
});
const specialties = new Set(
  tutors.flatMap(t => t.tutorProfile?.specialties || [])
);
```

## Common Patterns

### Pattern 1: List with Relations

```typescript
// ✅ Optimized
const bookings = await prisma.booking.findMany({
  include: {
    student: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    },
    tutor: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    },
  },
  take: 20,
  skip: offset,
});
```

### Pattern 2: Statistics

```typescript
// ✅ Optimized
const [total, stats] = await Promise.all([
  prisma.booking.count({ where }),
  prisma.booking.aggregate({
    where,
    _sum: { price: true },
    _avg: { price: true },
  }),
]);
```

### Pattern 3: Batch Fetching

```typescript
// ✅ Optimized
const userIds = [...uniqueUserIds];
const users = await prisma.user.findMany({
  where: { id: { in: userIds } },
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// Create a map for O(1) lookup
const userMap = new Map(users.map(u => [u.id, u]));
```

## Query Optimization Utilities

Use utilities from `lib/db/query-optimization.ts`:

```typescript
import {
  getAllTutorSpecialties,
  bookingWithRelations,
  tutorProfileWithRelations,
  batchFetchUsers,
  getTutorStatistics,
} from "@/lib/db/query-optimization";

// Get all specialties efficiently
const specialties = await getAllTutorSpecialties();

// Use predefined relation includes
const booking = await prisma.booking.findUnique({
  where: { id },
  include: bookingWithRelations,
});

// Batch fetch users
const userMap = await batchFetchUsers(userIds);

// Get statistics
const stats = await getTutorStatistics(tutorId);
```

## Performance Monitoring

### Enable Query Logging (Development)

In `lib/db/prisma.ts`, query logging is enabled in development:

```typescript
log: process.env.NODE_ENV === "development" 
  ? ["query", "error", "warn"] 
  : ["error"]
```

### Identify Slow Queries

1. Check Prisma query logs in development
2. Use `EXPLAIN ANALYZE` in PostgreSQL
3. Monitor query times in production
4. Use Sentry performance monitoring

### Query Analysis

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM "Booking" 
WHERE "tutorId" = '...' 
AND "status" NOT IN ('CANCELLED', 'REFUNDED');
```

## Indexes

Ensure proper indexes are in place (already in schema):

```prisma
model Booking {
  @@index([studentId])
  @@index([tutorId])
  @@index([scheduledAt])
  @@index([status])
  @@index([callId])
}
```

## Best Practices

### ✅ DO

1. **Always use `include` for relations** - Fetch related data in one query
2. **Use `select` to limit fields** - Only fetch what you need
3. **Use `Promise.all` for parallel queries** - Fetch independent data in parallel
4. **Use aggregations for statistics** - Don't fetch all records to count
5. **Use batch operations** - Fetch multiple items with `in` operator
6. **Use raw queries for complex operations** - When Prisma can't optimize

### ❌ DON'T

1. **Don't query in loops** - Use `include` or batch operations
2. **Don't fetch all fields** - Use `select` to limit data
3. **Don't fetch all records for counts** - Use `count()` or `aggregate()`
4. **Don't ignore indexes** - Ensure queries use indexed fields
5. **Don't fetch unnecessary relations** - Only include what you need

## Optimized Queries in Codebase

### Bookings List

**Location:** `app/api/bookings/route.ts`

```typescript
// ✅ Optimized: Single query with all relations
const bookings = await prisma.booking.findMany({
  where,
  include: {
    student: { select: { id: true, name: true, email: true, image: true } },
    tutor: {
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    },
  },
});
```

### Tutor Specialties

**Location:** `app/[locale]/tutors/page.tsx`

```typescript
// ✅ Optimized: Raw query for distinct values
const { getAllTutorSpecialties } = await import("@/lib/db/query-optimization");
const allLanguages = await getAllTutorSpecialties();
```

### Conflict Checking

**Location:** `app/api/bookings/route.ts`

```typescript
// ✅ Optimized: Only fetch necessary fields
const existingBookings = await prisma.booking.findMany({
  where: {
    tutorId,
    status: { notIn: ["CANCELLED", "REFUNDED"] },
  },
  select: {
    id: true,
    scheduledAt: true,
    duration: true,
    tutorId: true,
    status: true,
  },
});
```

## Testing Query Performance

### Development

1. Enable query logging in Prisma config
2. Check console for query count and duration
3. Use Prisma Studio to test queries
4. Monitor query logs for N+1 patterns

### Production

1. Use Sentry performance monitoring
2. Monitor database query times
3. Set up alerts for slow queries
4. Review query logs regularly

## Troubleshooting

### High Query Count

- Check for loops with database queries
- Verify `include` is used for relations
- Use batch operations instead of individual queries

### Slow Queries

- Check if indexes are being used
- Verify `select` limits fields
- Use aggregations instead of fetching all data
- Consider query optimization with `EXPLAIN ANALYZE`

### Memory Issues

- Use `select` to limit fields
- Implement pagination
- Use `take` to limit results
- Avoid fetching large datasets

## Related Documentation

- [Prisma Query Optimization](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization)
- [Database Setup](./DATABASE_SETUP.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)
