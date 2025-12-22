/**
 * Structured Data (JSON-LD) Components
 * 
 * Provides Schema.org structured data for SEO and Answer Engine Optimization
 * These components render JSON-LD scripts that help search engines understand content
 */

import { type Metadata } from "next";

/**
 * WebSite Schema
 * Provides site-wide information for search engines
 */
export function WebSiteSchema({
  url,
  name = "Linglix",
  description,
  potentialAction,
}: {
  url: string;
  name?: string;
  description?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(description && { description }),
    ...(potentialAction && { potentialAction }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Organization Schema
 * Used on homepage to identify the business
 */
export function OrganizationSchema({
  name = "Linglix",
  url,
  logo,
  description,
  sameAs = [],
}: {
  name?: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name,
    url,
    ...(logo && { logo: `${url}${logo}` }),
    ...(description && { description }),
    ...(sameAs.length > 0 && { sameAs }),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@linglix.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Person/Service Schema for Tutor Profiles
 * Provides rich snippets for tutor pages
 */
export function TutorSchema({
  name,
  url,
  image,
  bio,
  specialties,
  rating,
  reviewCount,
  hourlyRate,
  totalSessions,
}: {
  name: string;
  url: string;
  image?: string | null;
  bio?: string | null;
  specialties: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  totalSessions: number;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: "Language Tutor",
    ...(image && { image }),
    url,
    ...(bio && { description: bio }),
    knowsAbout: specialties,
    ...(rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.toString(),
        reviewCount: reviewCount.toString(),
        bestRating: "5",
        worstRating: "1",
      },
    }),
    offers: {
      "@type": "Offer",
      price: hourlyRate.toString(),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: `1-on-1 language lesson with ${name}`,
    },
    ...(totalSessions > 0 && {
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Total Sessions",
        value: totalSessions.toString(),
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ Schema
 * Optimizes for Answer Engine Optimization (AEO)
 */
export function FAQSchema({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * BreadcrumbList Schema
 * Helps search engines understand page hierarchy
 */
export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Course/Educational Service Schema
 * For language-specific landing pages
 */
export function CourseSchema({
  name,
  description,
  provider,
  price,
  priceCurrency = "USD",
}: {
  name: string;
  description: string;
  provider: string;
  price: number;
  priceCurrency?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
    },
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
