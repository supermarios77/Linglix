import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Next.js Middleware for authentication (App Router)
 * 
 * Protects routes and handles authentication redirects
 * 
 * Production considerations:
 * - Runs on edge runtime for performance
 * - Minimal logic to reduce latency
 * - Proper error handling
 * - App Router compatible
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

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
