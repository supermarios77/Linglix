import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Learn Languages with
          <span className="block text-foreground/80">Expert Tutors</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-foreground/60 sm:text-xl">
          Connect with qualified language tutors for personalized one-on-one
          sessions. Practice speaking, improve your skills, and achieve your
          language learning goals.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" variant="primary">
              Start Learning Today
            </Button>
          </Link>
          <Link href="/tutors">
            <Button size="lg" variant="outline">
              Browse Tutors
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Why Choose Linglix?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Expert Tutors</CardTitle>
              <CardDescription>
                Learn from qualified, experienced language tutors who are
                passionate about teaching.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flexible Scheduling</CardTitle>
              <CardDescription>
                Book sessions that fit your schedule. Learn at your own pace,
                whenever it's convenient for you.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Sessions</CardTitle>
              <CardDescription>
                Engage in real-time video sessions with interactive tools and
                personalized feedback.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="bg-foreground/5">
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Start Learning?</h2>
            <p className="mb-8 text-foreground/60">
              Join thousands of students already learning with Linglix
            </p>
            <Link href="/signup">
              <Button size="lg" variant="primary">
                Get Started Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
