# Testing Guide

This directory contains tests for critical flows in the Linglix application.

## Test Structure

```
tests/
├── setup.ts              # Global test setup and mocks
├── utils/
│   └── test-helpers.ts   # Test utility functions
└── api/
    ├── auth/             # Authentication flow tests
    ├── bookings/         # Booking flow tests
    └── payments/         # Payment flow tests
```

## Running Tests

### Run all tests
```bash
bun test
```

### Run tests in watch mode
```bash
bun test --watch
```

### Run tests with UI
```bash
bun test:ui
```

### Run tests once (CI mode)
```bash
bun test:run
```

### Run tests with coverage
```bash
bun test:coverage
```

## Test Coverage

### Critical Flows Tested

1. **Authentication**
   - ✅ User registration
   - ✅ Email verification
   - ✅ Password reset (forgot & reset)
   - ✅ Input validation
   - ✅ Error handling

2. **Payments**
   - ✅ Checkout session creation
   - ✅ Booking validation
   - ✅ Authorization checks
   - ✅ Stripe integration

3. **Bookings**
   - ✅ Booking creation
   - ✅ Availability validation
   - ✅ Conflict detection
   - ✅ Penalty checks
   - ✅ Price calculation

## Writing Tests

### Test File Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/your-route/route";
import { createMockRequest } from "@/tests/utils/test-helpers";

describe("POST /api/your-route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do something", async () => {
    // Arrange
    const request = createMockRequest("POST", { data: "test" });
    
    // Act
    const response = await POST(request);
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
```

### Mocking

Most external services are mocked in `tests/setup.ts`. You can override mocks in individual test files:

```typescript
vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: "email-123" }),
}));
```

### Test Helpers

Use utilities from `tests/utils/test-helpers.ts`:

- `createMockRequest()` - Create NextRequest for testing
- `createAuthenticatedRequest()` - Create authenticated request
- `testUserData` - Predefined test user data
- `futureDate()` - Create future dates
- `pastDate()` - Create past dates

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clear Names**: Test names should describe what they test
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Services**: Don't make real API calls
5. **Test Edge Cases**: Include error scenarios
6. **Clean Up**: Use `beforeEach` to reset mocks

## Continuous Integration

Tests run automatically in CI/CD pipelines. Ensure all tests pass before merging.

## Future Enhancements

- [ ] Integration tests with test database
- [ ] E2E tests with Playwright
- [ ] Component tests with React Testing Library
- [ ] Performance tests
- [ ] Load tests
