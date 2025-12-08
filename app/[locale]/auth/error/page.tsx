import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";

/**
 * Auth Error Page
 * 
 * Production-ready error page for authentication errors
 * - Localization
 * - Error type handling
 * - User-friendly messages
 * - SEO metadata
 */
export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("errorTitle"),
    description: t("errorDescription"),
  };
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const t = await getTranslations("auth");
  const locale = await getLocale();

  // Map NextAuth error codes to user-friendly messages
  const getErrorMessage = (errorCode?: string) => {
    if (!errorCode) {
      return t("errorTypes.Default");
    }

    switch (errorCode) {
      case "Configuration":
        return t("errorTypes.Configuration");
      case "AccessDenied":
        return t("errorTypes.AccessDenied");
      case "Verification":
        return t("errorTypes.Verification");
      default:
        return t("errorTypes.Default");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("errorTitle")}
          </h1>
          <p className="mt-2 text-muted">
            {t("errorDescription")}
          </p>
        </div>

        <div className="rounded-md bg-danger-soft p-4">
          <p className="text-sm font-medium text-danger-foreground">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/${locale}/auth/signin`}
            className="block w-full rounded-md bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
          >
            {t("errorGoBack")}
          </Link>

          <Link
            href={`/${locale}`}
            className="block w-full rounded-md border border-border bg-surface px-4 py-2 text-center text-sm font-medium text-surface-foreground hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}