import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isValidLocale, locales } from "./config";

/**
 * Next-intl request configuration
 * 
 * This function is called for every request to determine the locale
 * and load the appropriate translation messages
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !isValidLocale(locale)) {
    locale = defaultLocale;
  }

  // Import messages based on locale
  let messages;
  switch (locale) {
    case "en":
      messages = (await import("../../messages/en.json")).default;
      break;
    case "es":
      messages = (await import("../../messages/es.json")).default;
      break;
    default:
      messages = (await import("../../messages/en.json")).default;
  }

  return {
    locale,
    messages,
  };
});
