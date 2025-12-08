import Link from "next/link";
import { Button } from "../ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Linglix</span>
        </Link>

        <nav className="hidden items-center space-x-6 md:flex">
          <Link
            href="/tutors"
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            Find Tutors
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/signin">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

