# Internationalization (i18n) Setup

## Overview

Linglix uses `next-intl` for internationalization, supporting multiple languages with locale-based routing.

## Supported Locales

- **en** - English (default)
- **es** - Spanish
- **fr** - French
- **de** - German
- **it** - Italian
- **pt** - Portuguese
- **ja** - Japanese
- **ko** - Korean
- **zh** - Chinese

## File Structure

```
linglix/
├── i18n/
│   ├── config.ts          # Locale configuration
│   └── request.ts         # Next-intl request config
├── messages/
│   ├── en.json            # English translations
│   ├── es.json            # Spanish translations
│   └── ...                # Other locale files
└── app/
    └── [locale]/          # Locale-based routing
        ├── layout.tsx
        └── page.tsx
```

## How It Works

### 1. Locale-Based Routing

All pages are under `app/[locale]/` which creates URLs like:
- `/en/` - English home page
- `/es/` - Spanish home page
- `/en/dashboard` - English dashboard
- `/es/dashboard` - Spanish dashboard

### 2. Middleware Integration

The middleware (`middleware.ts`) combines:
- **i18n routing** - Detects and redirects to appropriate locale
- **Authentication** - Protects routes and handles redirects

### 3. Translation Files

Translation files are in `messages/` directory:
- Each locale has its own JSON file
- Organized by namespaces (e.g., `common`, `auth`, `tutor`)
- Nested structure for better organization

## Usage

### Server Components

```typescript
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("common");
  
  return <h1>{t("welcome")}</h1>;
}
```

### Client Components

```typescript
"use client";

import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("common");
  
  return <button>{t("submit")}</button>;
}
```

### Language Switcher

```typescript
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Layout() {
  return (
    <div>
      <LanguageSwitcher />
      {/* Your content */}
    </div>
  );
}
```

## Adding New Locales

1. **Add locale to config** (`i18n/config.ts`):
```typescript
export const locales = ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh", "ru"] as const;
```

2. **Create translation file** (`messages/ru.json`):
```json
{
  "common": {
    "welcome": "Добро пожаловать"
  }
}
```

3. **Update request config** (`i18n/request.ts`):
```typescript
case "ru":
  messages = (await import("../messages/ru.json")).default;
  break;
```

## Adding New Translations

1. Add keys to all locale files in `messages/`
2. Use nested structure for organization:
```json
{
  "common": {
    "welcome": "Welcome"
  },
  "auth": {
    "signIn": "Sign In"
  }
}
```

3. Access in components:
```typescript
const t = await getTranslations("common");
t("welcome"); // "Welcome"
```

## Best Practices

1. **Always use translations** - Never hardcode text
2. **Organize by namespace** - Group related translations
3. **Keep keys consistent** - Use same keys across all locales
4. **Test all locales** - Ensure translations work correctly
5. **Use descriptive keys** - `auth.signInTitle` not `auth.title1`

## Integration with Auth

Auth routes are locale-aware:
- Sign in: `/{locale}/auth/signin`
- Sign up: `/{locale}/auth/signup`
- Error: `/{locale}/auth/error`

The middleware automatically:
- Detects user's preferred locale
- Redirects to locale-specific auth pages
- Preserves locale in callback URLs

## Production Considerations

- ✅ All locales are statically generated
- ✅ Locale detection from browser headers
- ✅ Fallback to default locale
- ✅ SEO-friendly URLs with locale prefix
- ✅ Edge Runtime compatible

---

*Last updated: After i18n setup*
