import { useTranslations } from "next-intl";

/**
 * Home Page
 * 
 * Example page showing how to use translations with next-intl
 * 
 * Note: This is a Server Component, so we use getTranslations instead
 */
export default async function Home() {
  // For Server Components, we need to import getTranslations
  const { getTranslations } = await import("next-intl/server");
  const t = await getTranslations("common");

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">{t("welcome")}</h1>
        <p className="text-lg">Linglix - Learn Languages with Tutors</p>
      </main>
    </div>
  );
}