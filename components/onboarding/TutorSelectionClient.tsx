"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, Users, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tutor {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  specialties: string[];
  rating: number;
  hourlyRate: number;
  totalSessions: number;
  bio: string | null;
  isRecommended: boolean;
}

interface TutorSelectionClientProps {
  tutors: Tutor[];
  locale: string;
  hasRecommendations: boolean;
  studentPreferences: {
    learningGoal: string | null;
    currentLevel: string | null;
    preferredSchedule: string | null;
  };
}

/**
 * Tutor Selection Client Component
 * 
 * Displays recommended tutors after onboarding with easy booking.
 */
export function TutorSelectionClient({
  tutors,
  locale,
  hasRecommendations,
  studentPreferences,
}: TutorSelectionClientProps) {
  const t = useTranslations("onboarding.selectTutor");
  const tTutor = useTranslations("tutor");
  const router = useRouter();

  const handleBookTutor = (tutorSlug: string) => {
    router.push(`/${locale}/tutors/${tutorSlug}/book`);
  };

  const handleSkipToDashboard = () => {
    router.push(`/${locale}/dashboard`);
  };

  if (tutors.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">{t("noTutorsTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("noTutorsDescription")}</p>
          <Button onClick={handleSkipToDashboard} variant="outline">
            {t("goToDashboard")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">{t("badge")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          {hasRecommendations ? t("titleRecommended") : t("titleTopTutors")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {hasRecommendations
            ? t("descriptionRecommended")
            : t("descriptionTopTutors")}
        </p>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tutors.map((tutor) => (
          <Card
            key={tutor.id}
            className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 relative overflow-hidden"
          >
            {tutor.isRecommended && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-primary text-primary-foreground">
                  {t("recommended")}
                </Badge>
              </div>
            )}
            <CardContent className="p-6">
              {/* Circle Avatar & Basic Info */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 mb-4 group-hover:border-primary/50 transition-colors">
                  {tutor.image ? (
                    <Image
                      src={tutor.image}
                      alt={tutor.name}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl sm:text-3xl">
                      {tutor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <h3 className="font-semibold text-lg mb-2">
                    {tutor.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {tutor.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({tutor.totalSessions} {tTutor("sessions")})
                    </span>
                  </div>
                  <div className="text-base font-semibold text-primary mb-3">
                    ${tutor.hourlyRate.toFixed(0)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /{tTutor("hourly")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {tutor.specialties.slice(0, 3).map((specialty, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                  {tutor.specialties.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tutor.specialties.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Bio Preview */}
              {tutor.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 text-left">
                  {tutor.bio}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBookTutor(tutor.slug)}
                  className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="default"
                >
                  {t("bookNow")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                >
                  <Link href={`/${locale}/tutors/${tutor.slug}`}>
                    <span className="sr-only">{t("viewProfile")}</span>
                    <Users className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="text-center">
        <Button
          onClick={handleSkipToDashboard}
          variant="ghost"
          className="text-muted-foreground"
        >
          {t("skipToDashboard")}
        </Button>
        <span className="mx-4 text-muted-foreground">|</span>
        <Button asChild variant="link">
          <Link href={`/${locale}/tutors`}>
            {t("browseAllTutors")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
