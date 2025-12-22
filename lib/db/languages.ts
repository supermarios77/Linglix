/**
 * Language Utilities
 * 
 * Functions for fetching and managing language data with tutor counts
 */

import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/**
 * Language metadata for display
 */
export interface LanguageMetadata {
  name: string;
  flag: string;
  language: string; // Lowercase identifier for filtering
  gradient: string;
}

/**
 * Language with tutor count
 */
export interface LanguageWithCount extends LanguageMetadata {
  tutors: number;
}

/**
 * Common language mappings
 * Maps various language name variations to standardized display names
 */
const LANGUAGE_MAP: Record<string, LanguageMetadata> = {
  // Spanish variations
  spanish: { name: "Spanish", flag: "🇪🇸", language: "spanish", gradient: "from-[#ff6b4a] to-[#ffa94d]" },
  español: { name: "Spanish", flag: "🇪🇸", language: "spanish", gradient: "from-[#ff6b4a] to-[#ffa94d]" },
  "spanish language": { name: "Spanish", flag: "🇪🇸", language: "spanish", gradient: "from-[#ff6b4a] to-[#ffa94d]" },
  
  // French variations
  french: { name: "French", flag: "🇫🇷", language: "french", gradient: "from-[#4a90ff] to-[#4dc3ff]" },
  français: { name: "French", flag: "🇫🇷", language: "french", gradient: "from-[#4a90ff] to-[#4dc3ff]" },
  "french language": { name: "French", flag: "🇫🇷", language: "french", gradient: "from-[#4a90ff] to-[#4dc3ff]" },
  
  // Japanese variations
  japanese: { name: "Japanese", flag: "🇯🇵", language: "japanese", gradient: "from-[#ff4d8c] to-[#ff8f70]" },
  日本語: { name: "Japanese", flag: "🇯🇵", language: "japanese", gradient: "from-[#ff4d8c] to-[#ff8f70]" },
  "japanese language": { name: "Japanese", flag: "🇯🇵", language: "japanese", gradient: "from-[#ff4d8c] to-[#ff8f70]" },
  
  // German variations
  german: { name: "German", flag: "🇩🇪", language: "german", gradient: "from-[#6b4aff] to-[#a94dff]" },
  deutsch: { name: "German", flag: "🇩🇪", language: "german", gradient: "from-[#6b4aff] to-[#a94dff]" },
  "german language": { name: "German", flag: "🇩🇪", language: "german", gradient: "from-[#6b4aff] to-[#a94dff]" },
  
  // English variations
  english: { name: "English", flag: "🇬🇧", language: "english", gradient: "from-[#3b82f6] to-[#8b5cf6]" },
  "english language": { name: "English", flag: "🇬🇧", language: "english", gradient: "from-[#3b82f6] to-[#8b5cf6]" },
  "business english": { name: "English", flag: "🇬🇧", language: "english", gradient: "from-[#3b82f6] to-[#8b5cf6]" },
  "conversational english": { name: "English", flag: "🇬🇧", language: "english", gradient: "from-[#3b82f6] to-[#8b5cf6]" },
  
  // Italian variations
  italian: { name: "Italian", flag: "🇮🇹", language: "italian", gradient: "from-[#10b981] to-[#34d399]" },
  italiano: { name: "Italian", flag: "🇮🇹", language: "italian", gradient: "from-[#10b981] to-[#34d399]" },
  "italian language": { name: "Italian", flag: "🇮🇹", language: "italian", gradient: "from-[#10b981] to-[#34d399]" },
  
  // Portuguese variations
  portuguese: { name: "Portuguese", flag: "🇵🇹", language: "portuguese", gradient: "from-[#f59e0b] to-[#fbbf24]" },
  português: { name: "Portuguese", flag: "🇵🇹", language: "portuguese", gradient: "from-[#f59e0b] to-[#fbbf24]" },
  "portuguese language": { name: "Portuguese", flag: "🇵🇹", language: "portuguese", gradient: "from-[#f59e0b] to-[#fbbf24]" },
  
  // Chinese variations
  chinese: { name: "Chinese", flag: "🇨🇳", language: "chinese", gradient: "from-[#ef4444] to-[#f87171]" },
  中文: { name: "Chinese", flag: "🇨🇳", language: "chinese", gradient: "from-[#ef4444] to-[#f87171]" },
  mandarin: { name: "Chinese", flag: "🇨🇳", language: "chinese", gradient: "from-[#ef4444] to-[#f87171]" },
  "chinese language": { name: "Chinese", flag: "🇨🇳", language: "chinese", gradient: "from-[#ef4444] to-[#f87171]" },
  
  // Korean variations
  korean: { name: "Korean", flag: "🇰🇷", language: "korean", gradient: "from-[#6366f1] to-[#818cf8]" },
  한국어: { name: "Korean", flag: "🇰🇷", language: "korean", gradient: "from-[#6366f1] to-[#818cf8]" },
  "korean language": { name: "Korean", flag: "🇰🇷", language: "korean", gradient: "from-[#6366f1] to-[#818cf8]" },
  
  // Russian variations
  russian: { name: "Russian", flag: "🇷🇺", language: "russian", gradient: "from-[#8b5cf6] to-[#a78bfa]" },
  русский: { name: "Russian", flag: "🇷🇺", language: "russian", gradient: "from-[#8b5cf6] to-[#a78bfa]" },
  "russian language": { name: "Russian", flag: "🇷🇺", language: "russian", gradient: "from-[#8b5cf6] to-[#a78bfa]" },
  
  // Arabic variations
  arabic: { name: "Arabic", flag: "🇸🇦", language: "arabic", gradient: "from-[#14b8a6] to-[#5eead4]" },
  العربية: { name: "Arabic", flag: "🇸🇦", language: "arabic", gradient: "from-[#14b8a6] to-[#5eead4]" },
  "arabic language": { name: "Arabic", flag: "🇸🇦", language: "arabic", gradient: "from-[#14b8a6] to-[#5eead4]" },
};

/**
 * Normalize language name for matching
 */
function normalizeLanguageName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Get language metadata from a specialty/language string
 */
function getLanguageMetadata(specialty: string): LanguageMetadata | null {
  const normalized = normalizeLanguageName(specialty);
  
  // Direct match
  if (LANGUAGE_MAP[normalized]) {
    return LANGUAGE_MAP[normalized];
  }
  
  // Check if specialty contains a language name
  for (const [key, metadata] of Object.entries(LANGUAGE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return metadata;
    }
  }
  
  return null;
}

/**
 * Get languages with tutor counts
 * Only returns languages that have at least one approved, active tutor
 */
export async function getLanguagesWithTutorCounts(): Promise<LanguageWithCount[]> {
  // Get all unique specialties from approved, active tutors
  const result = await prisma.$queryRaw<Array<{ specialty: string; count: bigint }>>(
    Prisma.sql`
      SELECT 
        unnest(specialties) as specialty,
        COUNT(DISTINCT "TutorProfile"."id") as count
      FROM "TutorProfile"
      INNER JOIN "User" ON "User"."id" = "TutorProfile"."userId"
      WHERE "TutorProfile"."isActive" = true
        AND "TutorProfile"."approvalStatus" = 'APPROVED'
        AND "User"."role" = 'TUTOR'
      GROUP BY specialty
      HAVING COUNT(DISTINCT "TutorProfile"."id") > 0
      ORDER BY count DESC, specialty ASC
    `
  );

  // Map specialties to languages and aggregate counts
  const languageCounts = new Map<string, { metadata: LanguageMetadata; count: number }>();

  for (const row of result) {
    const metadata = getLanguageMetadata(row.specialty);
    if (metadata) {
      const existing = languageCounts.get(metadata.language);
      if (existing) {
        existing.count += Number(row.count);
      } else {
        languageCounts.set(metadata.language, {
          metadata,
          count: Number(row.count),
        });
      }
    }
  }

  // Convert to array and sort by count (descending)
  const languages: LanguageWithCount[] = Array.from(languageCounts.values())
    .map(({ metadata, count }) => ({
      ...metadata,
      tutors: count,
    }))
    .sort((a, b) => b.tutors - a.tutors);

  return languages;
}

