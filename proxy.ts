import { auth } from "@/config/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy for authentication (App Router)
 * 
 * Protects routes and handles authentication redirects.
 * 
 * In Next.js 16, middleware has been renamed to proxy to better reflect
 * its role in handling incoming requests at the network boundary.
 * 
 * Production considerations:
 * - Runs on Edge Runtime for performance
 * - Minimal logic to reduce latency
 * - Proper error handling
 * - App Router compatible
 * - Lightweight operations only (redirects, rewrites, headers)
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth",
    "/api/auth",
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes and API auth routes
  if (isPublicRoute || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to sign in if not authenticated
  if (!isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

/**
 * Configure which routes the proxy should run on
 * 
 * The proxy runs before the request reaches your application,
 * making it ideal for lightweight operations like redirects and rewrites.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - image files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
