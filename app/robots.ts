import { MetadataRoute } from "next";

/**
 * Robots.txt Configuration
 * 
 * Controls search engine crawling behavior
 * Allows public pages, disallows private/admin areas
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/auth/",
          "/onboarding/",
          "/profile/",
          "/sessions/",
          "/payments/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
