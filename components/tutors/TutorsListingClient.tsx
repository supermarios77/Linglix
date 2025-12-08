"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-[#e5e5e5] dark:border-[#262626] sticky top-0 z-50">
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
                className="pl-12 pr-4 py-6 text-base bg-white dark:bg-[#1a1a1a] border-2 border-[#e5e5e5] dark:border-[#262626] rounded-full focus:border-[#111] dark:focus:border-[#ccf381]"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 border-2 border-[#e5e5e5] dark:border-[#262626] hover:border-[#111] dark:hover:border-[#ccf381]"
            >
              <Filter className="w-4 h-4" />
              {t("filterBy")}
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-[#ccf381] text-black rounded-full text-xs font-semibold">
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
                Clear filters
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
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All languages</SelectItem>
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
                    Min {t("priceRange")} ($)
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
                    Max {t("priceRange")} ($)
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
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                      <SelectItem value="4.0">4.0+ ⭐</SelectItem>
                      <SelectItem value="3.5">3.5+ ⭐</SelectItem>
                      <SelectItem value="3.0">3.0+ ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                onClick={applyFilters}
                className="w-full sm:w-auto bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a]"
              >
                Apply Filters
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
              No tutors found
            </h3>
            <p className="text-[#666] dark:text-[#a1a1aa] mb-6">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-[#666] dark:text-[#a1a1aa]">
              Showing {tutors.length} of {totalCount} tutors
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tutors.map((tutor) => (
                <Link
                  key={tutor.id}
                  href={`/${locale}/tutors/${tutor.slug}`}
                  className="group bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-[24px] sm:rounded-[32px] p-6 transition-all duration-300 cursor-pointer border border-[#e5e5e5] dark:border-[#262626] hover:-translate-y-1 hover:border-[#d4d4d4] dark:hover:border-[#404040] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative w-full h-48 sm:h-56 rounded-[20px] overflow-hidden mb-4 bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex items-center justify-center border border-[#e5e5e5] dark:border-[#262626]">
                    {tutor.image ? (
                      <Image
                        src={tutor.image}
                        alt={tutor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Users className="w-16 h-16 text-[#ccc] dark:text-[#404040]" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-black dark:text-white group-hover:text-[#ccf381] transition-colors">
                        {tutor.name}
                      </h3>
                      <p className="text-sm text-[#888] dark:text-[#a1a1aa] line-clamp-1">
                        {tutor.specialties.join(" • ")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-[#ffb800] text-[#ffb800]" />
                        <span className="font-bold text-sm text-black dark:text-white">
                          {tutor.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-black dark:text-white">
                        ${tutor.hourlyRate}
                        <span className="text-xs text-[#888] dark:text-[#a1a1aa]">
                          /hr
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#888] dark:text-[#a1a1aa]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{tutor.totalSessions}+ {t("sessions")}</span>
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
                              ? "bg-[#111] dark:bg-[#ccf381] text-white dark:text-black"
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

