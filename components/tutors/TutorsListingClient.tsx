"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Star, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

interface TutorsListingClientProps {
  tutors: Tutor[];
  locale: string;
  search: string;
  language: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  languages: string[];
}

/**
 * Tutors Listing Client Component
 * 
 * Handles search, filtering, and pagination UI
 * Production-ready with proper TypeScript types
 */
export function TutorsListingClient({
  tutors,
  locale,
  search: initialSearch,
  language: initialLanguage,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  minRating: initialMinRating,
  currentPage,
  totalPages,
  totalCount,
  languages,
}: TutorsListingClientProps) {
  const t = useTranslations("tutor");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [language, setLanguage] = useState(initialLanguage);
  const [minPrice, setMinPrice] = useState(initialMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice?.toString() || "");
  const [minRating, setMinRating] = useState(initialMinRating?.toString() || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (language) params.set("language", language);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", minRating);
    if (currentPage > 1) params.set("page", currentPage.toString());

    router.push(`/${locale}/tutors?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setLanguage("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    router.push(`/${locale}/tutors`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/${locale}/tutors?${params.toString()}`);
  };

  const hasActiveFilters =
    search || language || minPrice || maxPrice || minRating;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-[#e5e5e5] dark:border-[#262626] sticky top-16 sm:top-20 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold mb-2 text-black dark:text-white">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa]">
              {t("subtitle")}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888] dark:text-[#666]" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-6 text-base bg-white dark:bg-[#1a1a1a] border-2 border-[#e5e5e5] dark:border-[#262626] rounded-full focus:border-[#111] dark:focus:border-accent"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-[#111] dark:hover:border-accent"
            >
              <Filter className="w-4 h-4" />
              {t("filterBy")}
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-accent text-black rounded-full text-xs font-semibold">
                  {[
                    search && "1",
                    language && "1",
                    minPrice && "1",
                    maxPrice && "1",
                    minRating && "1",
                  ]
                    .filter(Boolean)
                    .length}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                className="text-sm text-[#888] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                {t("clearFilters")}
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#262626] rounded-[24px] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    {t("language")}
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-white dark:bg-[#0a0a0a] border-2 border-[#e5e5e5] dark:border-[#262626]">
                      <SelectValue placeholder={t("allLanguages")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t("allLanguages")}</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    {t("min")} {t("priceRange")} ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-white dark:bg-[#0a0a0a] border-2 border-[#e5e5e5] dark:border-[#262626]"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    {t("max")} {t("priceRange")} ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-white dark:bg-[#0a0a0a] border-2 border-[#e5e5e5] dark:border-[#262626]"
                  />
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    Min {t("rating")}
                  </label>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger className="bg-white dark:bg-[#0a0a0a] border-2 border-[#e5e5e5] dark:border-[#262626]">
                      <SelectValue placeholder={t("any")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t("any")}</SelectItem>
                      <SelectItem value="4.5">{t("ratingOptions.rating45")}</SelectItem>
                      <SelectItem value="4.0">{t("ratingOptions.rating40")}</SelectItem>
                      <SelectItem value="3.5">{t("ratingOptions.rating35")}</SelectItem>
                      <SelectItem value="3.0">{t("ratingOptions.rating30")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                onClick={applyFilters}
                className="w-full sm:w-auto bg-[#111] dark:bg-accent text-white dark:text-black hover:bg-[#222] dark:hover:bg-brand-primary-light"
              >
                {t("applyFilters")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        {tutors.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-[#ccc] dark:text-[#404040]" />
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
              {t("noTutorsFound")}
            </h3>
            <p className="text-[#666] dark:text-[#a1a1aa] mb-6">
              {t("tryAdjustingFilters")}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                {t("clearAllFilters")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-[#666] dark:text-[#a1a1aa]">
              {t("showing")} {tutors.length} {t("of")} {totalCount} {t("tutors")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tutors.map((tutor) => (
                <Link
                  key={tutor.id}
                  href={`/${locale}/tutors/${tutor.slug}`}
                  className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] sm:rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-1 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Tutor Info */}
                    <div className="w-full space-y-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-black dark:text-white group-hover:text-accent transition-colors">
                        {tutor.name}
                      </h3>
                        {tutor.specialties && tutor.specialties.length > 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
                            {tutor.specialties.slice(0, 3).map((specialty, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#666] dark:text-[#a1a1aa] rounded-full border border-[#e5e5e5] dark:border-[#262626]"
                              >
                                {specialty}
                              </span>
                            ))}
                            {tutor.specialties.length > 3 && (
                              <span className="text-xs text-[#888] dark:text-[#a1a1aa]">
                                +{tutor.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bio */}
                      {tutor.bio && (
                        <p className="text-sm text-[#666] dark:text-[#a1a1aa] line-clamp-2 text-left">
                          {tutor.bio}
                      </p>
                      )}

                      {/* Rating and Price */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e5] dark:border-[#262626]">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                        <span className="font-bold text-sm text-black dark:text-white">
                          {tutor.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-black dark:text-white">
                        ${tutor.hourlyRate}
                        <span className="text-xs text-[#888] dark:text-[#a1a1aa]">
                          {t("hourly")}
                        </span>
                      </span>
                    </div>

                      {/* Sessions */}
                      <div className="flex items-center justify-center gap-2 text-xs text-[#888] dark:text-[#a1a1aa]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{tutor.totalSessions}+ {t("sessions")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-2 border-[#e5e5e5] dark:border-[#262626]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center gap-1">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-[#888] dark:text-[#a1a1aa]">
                            ...
                          </span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => goToPage(page)}
                          className={
                            currentPage === page
                              ? "bg-[#111] dark:bg-accent text-white dark:text-black"
                              : "border-2 border-[#e5e5e5] dark:border-[#262626]"
                          }
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-2 border-[#e5e5e5] dark:border-[#262626]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

