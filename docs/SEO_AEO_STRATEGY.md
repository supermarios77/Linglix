# SEO & AEO Strategy for Linglix

## Executive Summary

**Linglix** is a language learning platform connecting students with native tutors. This document outlines a comprehensive SEO (Search Engine Optimization) and AEO (Answer Engine Optimization) strategy to improve organic visibility, drive qualified traffic, and optimize for AI-powered search engines and assistants.

---

## 1. Current State Analysis

### ✅ What's Working
- Next.js 16 with App Router (excellent for SEO)
- Multi-language support (i18n) with next-intl
- Server-side rendering for better indexing
- Basic metadata on key pages
- Clean URL structure (`/[locale]/tutors/[tutorName]`)
- Image optimization configured

### ❌ What's Missing
- **No structured data (JSON-LD)** - Critical for rich snippets
- **No sitemap.xml** - Search engines can't discover all pages
- **No robots.txt** - Missing crawl directives
- **Incomplete metadata** - Missing Open Graph, Twitter Cards
- **No canonical URLs** - Risk of duplicate content
- **No hreflang tags** - Multi-language SEO not optimized
- **No FAQ schema** - Missing answer engine optimization
- **No breadcrumbs** - Poor navigation signals
- **Limited content** - No blog/educational content
- **No local SEO** - If targeting specific regions

---

## 2. SEO Strategy

### 2.1 Technical SEO Foundation

#### A. Sitemap Generation
**Priority: HIGH | Effort: Medium**

Create dynamic sitemap that includes:
- All tutor profile pages
- All language variants (`/en/tutors`, `/es/tutors`)
- Static pages (home, about, pricing)
- Filtered tutor listing pages (with pagination)

**Implementation:**
```typescript
// app/sitemap.ts
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linglix.com';
  const locales = ['en', 'es']; // Add more as needed
  
  // Generate URLs for all tutors across all locales
  const tutors = await getAllTutors();
  const tutorUrls = tutors.flatMap(tutor => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/tutors/${tutor.slug}`,
      lastModified: tutor.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );
  
  // Add static pages
  const staticPages = locales.flatMap(locale => [
    { url: `${baseUrl}/${locale}`, priority: 1.0 },
    { url: `${baseUrl}/${locale}/tutors`, priority: 0.9 },
    // ... more static pages
  ]);
  
  return [...staticPages, ...tutorUrls];
}
```

#### B. Robots.txt
**Priority: HIGH | Effort: Low**

```txt
# app/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /auth/
Disallow: /onboarding/
Disallow: /profile/
Disallow: /sessions/

# Sitemap
Sitemap: https://linglix.com/sitemap.xml
```

#### C. Canonical URLs
**Priority: HIGH | Effort: Medium**

Add canonical tags to prevent duplicate content:
- Each page should have a canonical pointing to the primary language version
- Filtered/search pages should canonicalize to main listing page
- Paginated pages should canonicalize to page 1

#### D. Hreflang Tags
**Priority: HIGH | Effort: Medium**

Critical for multi-language SEO:
```typescript
// In layout.tsx or page metadata
export const metadata = {
  alternates: {
    canonical: `https://linglix.com/${locale}/tutors`,
    languages: {
      'en': 'https://linglix.com/en/tutors',
      'es': 'https://linglix.com/es/tutors',
      'x-default': 'https://linglix.com/en/tutors',
    },
  },
};
```

---

### 2.2 On-Page SEO

#### A. Enhanced Metadata Strategy

**Homepage:**
```typescript
export async function generateMetadata() {
  return {
    title: "Linglix - Learn Languages with Native Tutors Online | 1-on-1 Lessons",
    description: "Connect with certified native language tutors for personalized 1-on-1 lessons. Learn Spanish, English, French, and more. Book your first session today!",
    keywords: "language learning, online tutors, native speakers, Spanish tutor, English tutor, French tutor, language lessons",
    openGraph: {
      title: "Linglix - Learn Languages with Native Tutors",
      description: "Connect with certified native language tutors for personalized lessons",
      url: "https://linglix.com",
      siteName: "Linglix",
      images: [{
        url: "https://linglix.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Linglix - Language Learning Platform",
      }],
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Linglix - Learn Languages with Native Tutors",
      description: "Connect with certified native language tutors",
      images: ["https://linglix.com/twitter-image.jpg"],
    },
    alternates: {
      canonical: `https://linglix.com/${locale}`,
      languages: {
        'en': 'https://linglix.com/en',
        'es': 'https://linglix.com/es',
        'x-default': 'https://linglix.com/en',
      },
    },
  };
}
```

**Tutor Profile Pages:**
- Dynamic title: `{Tutor Name} - {Language} Tutor | Linglix`
- Rich description with specialties, rating, experience
- Open Graph image with tutor photo
- Structured data (Person/Service schema)

**Tutor Listing Pages:**
- Title: `Find {Language} Tutors Online | Linglix`
- Description with filter context
- Canonical to main listing page

#### B. Semantic HTML Structure

Ensure proper heading hierarchy:
- H1: Main page title (one per page)
- H2: Major sections
- H3: Subsections
- Use semantic HTML5 elements (`<article>`, `<section>`, `<nav>`)

#### C. Internal Linking Strategy

- Link from homepage to popular tutor categories
- Cross-link between related tutors (same language/specialty)
- Breadcrumb navigation on all pages
- Related tutors section on profile pages

---

### 2.3 Structured Data (Schema.org)

**Priority: CRITICAL | Effort: High**

#### A. Organization Schema (Homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Linglix",
  "url": "https://linglix.com",
  "logo": "https://linglix.com/logo.png",
  "description": "Online language learning platform",
  "sameAs": [
    "https://twitter.com/linglix",
    "https://facebook.com/linglix"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@linglix.com"
  }
}
```

#### B. Person/Service Schema (Tutor Profiles)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tutor Name",
  "jobTitle": "Language Tutor",
  "image": "tutor-photo.jpg",
  "url": "https://linglix.com/en/tutors/tutor-name",
  "offers": {
    "@type": "Offer",
    "price": "25.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

#### C. FAQ Schema (Answer Engine Optimization)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "How do I book a language lesson?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "To book a lesson, browse our tutors, select a time slot, and complete payment. You'll receive a confirmation email with the video call link."
    }
  }]
}
```

#### D. BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://linglix.com"
  }, {
    "@type": "ListItem",
    "position": 2,
    "name": "Tutors",
    "item": "https://linglix.com/tutors"
  }]
}
```

#### E. Course/Educational Service Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Spanish Language Lessons",
  "description": "Learn Spanish with native tutors",
  "provider": {
    "@type": "Organization",
    "name": "Linglix"
  },
  "offers": {
    "@type": "Offer",
    "price": "25",
    "priceCurrency": "USD"
  }
}
```

---

### 2.4 Content Strategy

#### A. Blog/Educational Content
**Priority: MEDIUM | Effort: High**

Create content hub for:
- Language learning tips
- Tutor spotlights
- Success stories
- Grammar guides
- Cultural insights

**Target Keywords:**
- "how to learn [language]"
- "best way to learn [language] online"
- "[language] grammar guide"
- "find [language] tutor online"

#### B. Landing Pages for Languages
Create dedicated pages:
- `/learn-spanish`
- `/learn-english`
- `/learn-french`
- Each with unique content, tutor listings, testimonials

#### C. FAQ Pages
- `/faq` - General questions
- `/faq/tutors` - For tutors
- `/faq/students` - For students
- Implement FAQ schema for AEO

---

### 2.5 Performance SEO

**Current:** Good (Next.js optimization)
**Improvements:**
- Implement lazy loading for images below fold
- Add resource hints (`preconnect`, `dns-prefetch`)
- Optimize font loading (already using `display: swap`)
- Minimize JavaScript bundle size
- Implement service worker for offline support

---

## 3. AEO (Answer Engine Optimization) Strategy

AEO optimizes for AI-powered search (ChatGPT, Perplexity, Google's AI Overview, etc.)

### 3.1 Structured Data for AI

AI assistants heavily rely on structured data:
- **FAQ Schema** - Answers common questions
- **HowTo Schema** - Step-by-step guides
- **Article Schema** - Educational content
- **Review Schema** - Tutor reviews/ratings

### 3.2 Natural Language Content

- Write in conversational, Q&A format
- Use complete sentences (not fragments)
- Answer "who, what, when, where, why, how"
- Include context and explanations

### 3.3 FAQ Implementation

**Priority: HIGH | Effort: Medium**

Add FAQ sections to:
- Homepage
- Tutor profile pages
- Booking pages
- Pricing pages

**Example FAQ for Homepage:**
```typescript
const faqs = [
  {
    question: "How does Linglix work?",
    answer: "Linglix connects students with certified native language tutors for personalized 1-on-1 video lessons. Students browse tutor profiles, book sessions at their preferred times, and learn through interactive video calls with real-time feedback."
  },
  {
    question: "How much do language lessons cost?",
    answer: "Lesson prices vary by tutor and range from $15 to $50 per hour. Most tutors offer 30-minute and 60-minute sessions. You can filter tutors by price range on our tutors page."
  },
  // ... more FAQs
];
```

### 3.4 HowTo Content

Create step-by-step guides:
- "How to book your first language lesson"
- "How to prepare for a language lesson"
- "How to become a tutor on Linglix"

Use HowTo schema markup.

### 3.5 Entity Optimization

Ensure AI can understand:
- **What** Linglix is (Educational platform)
- **Who** it's for (Students and tutors)
- **Where** it operates (Online, global)
- **When** lessons are available (24/7 booking)
- **Why** use it (Native tutors, personalized, flexible)

---

## 4. International SEO

### 4.1 Hreflang Implementation

**Priority: HIGH | Effort: Medium**

```typescript
// In each page's metadata
alternates: {
  languages: {
    'en': 'https://linglix.com/en/tutors',
    'es': 'https://linglix.com/es/tutors',
    'fr': 'https://linglix.com/fr/tutors',
    'x-default': 'https://linglix.com/en/tutors',
  },
}
```

### 4.2 Geo-Targeting

If targeting specific countries:
- Use `hreflang` with country codes (`en-US`, `en-GB`)
- Set up Google Search Console for each country
- Consider country-specific domains if needed

---

## 5. Local SEO (If Applicable)

If targeting specific cities/regions:

### 5.1 Location Pages
- `/tutors/los-angeles`
- `/tutors/new-york`
- Each with local tutors, testimonials

### 5.2 Local Business Schema
```json
{
  "@type": "LocalBusiness",
  "name": "Linglix",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "City",
    "addressRegion": "State",
    "addressCountry": "US"
  }
}
```

---

## 6. Technical Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create `sitemap.ts` with dynamic generation
- [ ] Add `robots.txt`
- [ ] Implement canonical URLs
- [ ] Add hreflang tags
- [ ] Enhance metadata (Open Graph, Twitter Cards)

### Phase 2: Structured Data (Week 3-4)
- [ ] Organization schema (homepage)
- [ ] Person/Service schema (tutor profiles)
- [ ] BreadcrumbList schema
- [ ] FAQ schema (homepage + key pages)
- [ ] Review/AggregateRating schema

### Phase 3: Content & AEO (Week 5-6)
- [ ] Create FAQ pages with schema
- [ ] Add FAQ sections to key pages
- [ ] Create HowTo guides with schema
- [ ] Implement breadcrumb navigation
- [ ] Add internal linking strategy

### Phase 4: Advanced (Week 7-8)
- [ ] Create blog/content hub
- [ ] Language-specific landing pages
- [ ] Performance optimizations
- [ ] Set up Google Search Console
- [ ] Set up Bing Webmaster Tools

---

## 7. Key Performance Indicators (KPIs)

### SEO Metrics
- **Organic traffic** - Target: +50% in 6 months
- **Keyword rankings** - Track top 20 keywords
- **Click-through rate (CTR)** - Target: 3-5%
- **Bounce rate** - Target: <50%
- **Pages indexed** - Target: 100% of public pages
- **Backlinks** - Target: 50+ quality backlinks

### AEO Metrics
- **AI citation rate** - Mentions in AI responses
- **FAQ impressions** - Rich snippet appearances
- **Voice search rankings** - "How to" queries
- **Featured snippet appearances**

---

## 8. Competitive Analysis

### Research Competitors
- italki
- Preply
- Verbling
- Cambly

**Analyze:**
- Their top-ranking pages
- Content strategy
- Backlink profile
- Structured data usage
- Keyword gaps

---

## 9. Content Calendar

### Monthly Content Plan
- **Week 1:** Blog post (language learning tips)
- **Week 2:** Tutor spotlight
- **Week 3:** Success story/testimonial
- **Week 4:** Grammar/educational guide

### Quarterly Goals
- 12 blog posts
- 4 tutor spotlights
- 4 success stories
- 4 educational guides

---

## 10. Tools & Resources

### SEO Tools
- Google Search Console
- Google Analytics 4
- Ahrefs / SEMrush (keyword research)
- Screaming Frog (technical audit)
- Schema.org validator

### AEO Tools
- ChatGPT / Perplexity (test queries)
- Google's Rich Results Test
- Schema Markup Validator

---

## 11. Next Steps

1. **Review this strategy** - Discuss priorities and timeline
2. **Approve Phase 1** - Start with foundation
3. **Set up tracking** - Google Search Console, Analytics
4. **Begin implementation** - Start with sitemap and robots.txt
5. **Monitor & iterate** - Track progress monthly

---

## Questions for Discussion

1. **Target Markets:** Which languages/countries are priority?
2. **Content Resources:** Do we have writers/content creators?
3. **Timeline:** What's the desired launch timeline?
4. **Budget:** Any budget for SEO tools/content?
5. **Local SEO:** Are we targeting specific cities/regions?
6. **Blog Strategy:** Should we create a blog/content hub?
7. **Competitors:** Who are our main competitors to analyze?

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** After Phase 1 completion
