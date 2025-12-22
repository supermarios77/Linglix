import { MetadataRoute } from "next";

/**
 * Robots.txt Configuration
 * 
 * Controls search engine crawling behavior
 * Allows public pages, disallows private/admin areas
 * 
 * SEO Best Practices:
 * - Allow public pages (homepage, tutors)
 * - Disallow private areas (dashboard, admin, auth)
 * - Disallow API routes
 * - Reference sitemap for better indexing
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/*/tutors",
          "/*/tutors/*",
        ],
        disallow: [
          "/api/",
          "/*/dashboard/",
          "/*/admin/",
          "/*/auth/",
          "/*/onboarding/",
          "/*/profile/",
          "/*/sessions/",
          "/*/payments/",
          "/_next/",
          "/static/",
        ],
      },
      // Specific rules for Googlebot
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/*/tutors",
          "/*/tutors/*",
        ],
        disallow: [
          "/api/",
          "/*/dashboard/",
          "/*/admin/",
          "/*/auth/",
          "/*/onboarding/",
          "/*/profile/",
          "/*/sessions/",
          "/*/payments/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
