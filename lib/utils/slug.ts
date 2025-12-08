/**
 * Slug Utility Functions
 * 
 * Converts strings to URL-friendly slugs
 * Used for tutor name URLs
 */

/**
 * Converts a string to a URL-friendly slug
 * 
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 * 
 * @example
 * slugify("John Doe") // "john-doe"
 * slugify("Maya Li") // "maya-li"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, "")
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Converts a slug back to a readable name (basic reversal)
 * Note: This is a simple reversal and may not perfectly restore original
 * 
 * @param slug - The slug to convert back
 * @returns A readable name
 * 
 * @example
 * unslugify("john-doe") // "John Doe"
 */
export function unslugify(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

