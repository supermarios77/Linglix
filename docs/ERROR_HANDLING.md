# Error Handling Guide

## Overview

Linglix implements production-ready error handling that provides:
- **User-friendly messages** - Clear, actionable error messages for end users
- **Developer-friendly logging** - Detailed error information logged to Sentry
- **Consistent error format** - Standardized error responses across the application
- **Error boundaries** - Graceful error recovery in React components

## Architecture

### Error Handling Layers

1. **Global Error Handler** (`app/global-error.tsx`)
   - Catches errors in root layout
   - Last resort error handler

2. **Route Error Handler** (`app/[locale]/error.tsx`)
   - Catches errors in page components
   - Provides recovery options

3. **Not Found Handler** (`app/[locale]/not-found.tsx`)
   - Handles 404 errors
   - Provides navigation options

4. **Error Boundary** (`components/ErrorBoundary.tsx`)
   - Catches errors in React components
   - Isolates errors to specific components

5. **API Error Handler** (`lib/errors.ts`)
   - Standardizes API error responses
   - Logs errors to Sentry

## Usage

### Server-Side (API Routes)

#### Basic Error Handling

```typescript
import { createErrorResponse, Errors } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Your code here
  } catch (error) {
    return createErrorResponse(error, "Failed to fetch data");
  }
}
```

#### Using HTTP Errors

```typescript
import { Errors } from "@/lib/errors";

// Throw specific errors
throw Errors.NotFound("User not found");
throw Errors.Unauthorized("Please sign in");
throw Errors.BadRequest("Invalid email format");
```

#### With Error Wrapper

```typescript
import { withErrorHandling } from "@/lib/errors/api-wrapper";

export const GET = withErrorHandling(async (request) => {
  // Your handler code - errors are automatically caught
  return NextResponse.json({ data: "success" });
}, "Failed to process request");
```

#### Database Error Handling

```typescript
import { handleDatabaseError } from "@/lib/errors/database";

try {
  await prisma.user.create({ data });
} catch (error) {
  const httpError = handleDatabaseError(error);
  return createErrorResponse(httpError);
}
```

#### Validation Error Handling

```typescript
import { createValidationErrorResponse } from "@/lib/errors/validation";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

try {
  const data = schema.parse(requestBody);
} catch (error) {
  if (error instanceof z.ZodError) {
    return createErrorResponse(createValidationErrorResponse(error));
  }
}
```

### Client-Side (React Components)

#### Using Error Handler Hook

```typescript
"use client";

import { useErrorHandler } from "@/lib/hooks/use-error-handler";
import { Alert } from "@/components/ui/alert";

export function MyComponent() {
  const { error, handleError, clearError, isRetryable } = useErrorHandler({
    context: "MyComponent",
  });

  const handleAction = async () => {
    try {
      await someAsyncOperation();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive">
          {error}
          {isRetryable && (
            <button onClick={handleAction}>Retry</button>
          )}
        </Alert>
      )}
      {/* Your component */}
    </div>
  );
}
```

#### Using Error Boundary

```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

#### Formatting Errors for Display

```typescript
import { formatErrorMessage } from "@/lib/errors/client";

try {
  await fetch("/api/data");
} catch (error) {
  const userMessage = formatErrorMessage(error);
  setError(userMessage);
}
```

## Error Types

### HTTP Errors

- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User lacks permission
- `404 Not Found` - Resource doesn't exist
- `400 Bad Request` - Invalid input
- `409 Conflict` - Resource conflict
- `429 Rate Limit` - Too many requests
- `500 Internal Server Error` - Server error

### Database Errors

Automatically handled and converted to user-friendly messages:
- Unique constraint violations
- Foreign key violations
- Record not found
- Connection errors

### Validation Errors

Zod validation errors are automatically formatted for users.

## Error Messages

### Production vs Development

- **Production**: Generic, user-friendly messages
- **Development**: Detailed error messages with stack traces

### User-Friendly Messages

All errors include:
- Clear explanation of what went wrong
- Actionable next steps
- No technical jargon
- No sensitive data

### Developer Logging

All errors are logged with:
- Full error details
- Stack traces
- Context information
- Sentry integration

## Best Practices

1. **Always use error handlers** - Don't let errors bubble up unhandled
2. **Provide context** - Include context in error handlers for better debugging
3. **User-friendly messages** - Always show helpful messages to users
4. **Log everything** - Let Sentry capture all errors for developers
5. **Don't leak data** - Never expose sensitive information in error messages
6. **Use appropriate error types** - Use the correct HTTP status codes
7. **Handle validation** - Always validate input and provide clear feedback

## Examples

### API Route Example

```typescript
import { withErrorHandling } from "@/lib/errors/api-wrapper";
import { Errors } from "@/lib/errors";
import { handleDatabaseError } from "@/lib/errors/database";

export const POST = withErrorHandling(async (request) => {
  const body = await request.json();
  
  // Validate
  if (!body.email) {
    throw Errors.BadRequest("Email is required");
  }

  try {
    const user = await prisma.user.create({ data: body });
    return NextResponse.json({ user });
  } catch (error) {
    // Handle database errors
    throw handleDatabaseError(error);
  }
}, "Failed to create user");
```

### Client Component Example

```typescript
"use client";

import { useErrorHandler } from "@/lib/hooks/use-error-handler";
import { useState } from "react";

export function UserForm() {
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler({
    context: "UserForm",
  });

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    clearError();
    
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      // Success
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert variant="destructive">{error}</Alert>}
      {/* Form fields */}
    </form>
  );
}
```

## Error Pages

### 404 Not Found
- Located at: `app/[locale]/not-found.tsx`
- Shows helpful navigation options
- Suggests common pages

### Error Page
- Located at: `app/[locale]/error.tsx`
- Shows user-friendly error message
- Provides retry and home navigation
- Shows technical details in development

### Global Error
- Located at: `app/global-error.tsx`
- Catches root-level errors
- Last resort error handler

## Monitoring

All errors are automatically:
- Logged to Sentry in production
- Tagged with context information
- Tracked with error IDs
- Available in Sentry dashboard

## Testing Error Handling

### Development
- Errors show full details
- Stack traces visible
- Easy to debug

### Production
- Generic user messages
- Errors logged to Sentry
- No sensitive data exposed
