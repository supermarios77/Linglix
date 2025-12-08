import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Next.js 16 Configuration
 * 
 * Production-ready configuration for Linglix
 */
const nextConfig: NextConfig = {
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  reactStrictMode: true, // Enable React strict mode
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Add remote image patterns as needed
      // {
      //   protocol: "https",
      //   hostname: "example.com",
      // },
    ],
  },
};

export default withNextIntl(nextConfig);
