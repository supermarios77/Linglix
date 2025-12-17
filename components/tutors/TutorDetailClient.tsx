"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Users, Clock, CheckCircle2, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface Tutor {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  email: string;
  bio: string | null;
  specialties: string[];
  rating: number;
  hourlyRate: number;
  totalSessions: number;
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    studentId: string;
    studentName: string | null;
    studentImage: string | null;
    createdAt: Date;
    tags: string[];
  }[];
}

interface TutorDetailClientProps {
  tutor: Tutor;
  locale: string;
}

/**
 * Tutor Detail Client Component
 * 
 * Displays full tutor profile with bio, specialties, availability, and reviews
 * Production-ready with proper TypeScript types
 */
export function TutorDetailClient({
  tutor,
  locale,
}: TutorDetailClientProps) {
  const t = useTranslations("tutor");

  const dayNames = [
    t("days.sunday"),
    t("days.monday"),
    t("days.tuesday"),
    t("days.wednesday"),
    t("days.thursday"),
    t("days.friday"),
    t("days.saturday"),
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white">
      {/* Back Button */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pt-4 sm:pt-6">
        <Link
          href={`/${locale}/tutors`}
          className="inline-flex items-center gap-2 text-sm text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToTutors")}
        </Link>
      </div>

      {/* Tutor Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 pb-8 sm:pb-12">
        <div className="bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 md:p-12 border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Image */}
            <div className="md:col-span-1">
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-[24px] overflow-hidden bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626] flex items-center justify-center">
                {tutor.image ? (
                  <Image
                    src={tutor.image}
                    alt={tutor.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Users className="w-32 h-32 text-[#ccc] dark:text-[#404040]" />
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold mb-3 text-black dark:text-white">
                  {tutor.name}
                </h1>
                <p className="text-lg text-[#666] dark:text-[#a1a1aa] mb-4">
                  {tutor.specialties.join(" • ")}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex text-[#ffb800]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(tutor.rating)
                            ? "fill-[#ffb800] text-[#ffb800]"
                            : "fill-none text-[#e5e5e5] dark:text-[#404040]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xl font-bold text-black dark:text-white">
                    {tutor.rating.toFixed(1)}
                  </span>
                </div>
                <div className="h-8 w-px bg-[#e5e5e5] dark:bg-[#262626]" />
                <div>
                  <div className="text-sm text-[#888] dark:text-[#a1a1aa]">
                    {t("sessions")}
                  </div>
                  <div className="text-xl font-bold text-black dark:text-white">
                    {tutor.totalSessions}+
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#888] dark:text-[#a1a1aa]">
                    {t("priceRange")}
                  </div>
                  <div className="text-xl font-bold text-black dark:text-white">
                    ${tutor.hourlyRate}
                    <span className="text-base text-[#888] dark:text-[#a1a1aa]">
                      {t("hourly")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-3">
                {tutor.specialties.map((specialty, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm font-medium text-black dark:text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>{specialty}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href={`/${locale}/tutors/${tutor.slug}/book`}>
                <Button
                  size="lg"
                  className="w-full md:w-auto bg-[#111] dark:bg-accent text-white dark:text-black px-10 py-6 rounded-full font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:bg-[#222] dark:hover:bg-brand-primary-light"
                >
                  {t("bookSession")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {tutor.bio && (
          <div className="mt-8 bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 md:p-12 border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
              {t("about")} {tutor.name}
            </h2>
            <p className="text-base leading-relaxed text-[#666] dark:text-[#a1a1aa] whitespace-pre-line">
              {tutor.bio}
            </p>
          </div>
        )}

        {/* Availability Section */}
        {tutor.availability.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 md:p-12 border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black dark:text-white">
              <Calendar className="w-6 h-6" />
              {t("availability")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutor.availability.map((avail, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white/50 dark:bg-[#0a0a0a]/50 rounded-[16px] border border-[#e5e5e5] dark:border-[#262626]"
                >
                  <Clock className="w-5 h-5 text-accent" />
                  <div>
                    <div className="font-semibold text-black dark:text-white">
                      {dayNames[avail.dayOfWeek]}
                    </div>
                    <div className="text-sm text-[#666] dark:text-[#a1a1aa]">
                      {avail.startTime} - {avail.endTime} ({avail.timezone})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[32px] p-6 sm:p-8 md:p-12 border border-[#e5e5e5] dark:border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
            {t("reviews")} ({tutor.reviews.length})
          </h2>
          {tutor.reviews.length === 0 ? (
            <p className="text-[#666] dark:text-[#a1a1aa]">
              {t("noReviewsYet")}
            </p>
          ) : (
            <div className="space-y-6">
              {tutor.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-[#e5e5e5] dark:border-[#262626] rounded-2xl p-6 bg-[#fafafa] dark:bg-[#1a1a1a]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {review.studentImage ? (
                        <Image
                          src={review.studentImage}
                          alt={review.studentName || "Student"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black font-semibold">
                          {(review.studentName || "S")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-black dark:text-white">
                          {review.studentName || "Anonymous"}
                        </p>
                        <p className="text-sm text-[#666] dark:text-[#a1a1aa]">
                          {new Date(review.createdAt).toLocaleDateString(
                            locale === "es" ? "es-ES" : "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? "fill-accent text-accent"
                              : "fill-none text-[#e5e5e5] dark:text-[#262626]"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[#111] dark:text-white mb-3">
                      {review.comment}
                    </p>
                  )}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

