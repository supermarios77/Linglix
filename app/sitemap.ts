import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { locales } from "@/i18n/config";
import { slugify } from "@/lib/utils/slug";

/**
 * Dynamic Sitemap Generation
 * 
 * Generates sitemap.xml with all public pages:
 * - Homepage (all locales)
 * - Tutor listing pages (all locales)
 * - Individual tutor profiles (all locales)
 * 
 * Revalidates every hour to include new tutors
 */
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://linglix.com";

  // Get all approved and active tutors
  // Wrap in try-catch to handle database errors during build
  let tutors: Array<{ id: string; name: string; updatedAt: Date }> = [];
  try {
    const tutorResults = await prisma.user.findMany({
      where: {
        role: "TUTOR",
        tutorProfile: {
          isActive: true,
          approvalStatus: "APPROVED",
        },
        name: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    // Filter out any null names (defensive programming)
    tutors = tutorResults.filter((tutor): tutor is { id: string; name: string; updatedAt: Date } => 
      tutor.name !== null
    );
  } catch (error) {
    // If database query fails during build, log error and continue with static pages only
    // This prevents build failures when database is unavailable or schema is out of sync
    console.error("Failed to fetch tutors for sitemap:", error);
    // Continue with empty tutors array - static pages will still be included
  }

  // Generate static page URLs for all locales
  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/${locale}/tutors`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
  ]);

  // Generate tutor profile URLs for all locales
  const tutorPages: MetadataRoute.Sitemap = tutors.flatMap((tutor) => {
    const slug = slugify(tutor.name!);
    return locales.map((locale) => ({
      url: `${baseUrl}/${locale}/tutors/${slug}`,
      lastModified: tutor.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  });

  return [...staticPages, ...tutorPages];
}
