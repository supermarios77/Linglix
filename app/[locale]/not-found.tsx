import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

/**
 * 404 Not Found Page
 * 
 * User-friendly 404 page with helpful navigation options
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-8 sm:p-10 border border-[#e5e5e5] dark:border-[#262626] shadow-lg">
          {/* 404 Number */}
          <div className="mb-6">
            <h1 className="text-7xl sm:text-8xl font-bold text-black dark:text-white mb-2">
              404
            </h1>
            <div className="w-20 h-1 bg-accent mx-auto rounded-full" />
          </div>

          {/* Message */}
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-3">
            Page not found
          </h2>
          <p className="text-base text-[#666] dark:text-[#a1a1aa] mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-[#111] dark:bg-accent text-white dark:text-black hover:bg-[#222] dark:hover:bg-brand-primary-light">
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Button>
            </Link>
            <Link href="/tutors" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-accent"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse tutors
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 pt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
            <p className="text-sm text-[#888] dark:text-[#666] mb-3">
              You might be looking for:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/tutors"
                className="text-sm text-accent hover:underline"
              >
                Find Tutors
              </Link>
              <span className="text-[#888] dark:text-[#666]">•</span>
              <Link
                href="/dashboard"
                className="text-sm text-accent hover:underline"
              >
                Dashboard
              </Link>
              <span className="text-[#888] dark:text-[#666]">•</span>
              <Link
                href="/profile"
                className="text-sm text-accent hover:underline"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
