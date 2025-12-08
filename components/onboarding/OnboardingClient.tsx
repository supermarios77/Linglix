"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowRight, ArrowLeft, GraduationCap, UserCheck, Loader2, Sparkles, CheckCircle2, X } from "lucide-react";

interface OnboardingClientProps {
  locale: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
  };
}

type OnboardingStep = "role" | "student-questions" | "tutor-questions" | "complete";

/**
 * Onboarding Client Component
 *
 * Beautiful, production-ready onboarding flow matching landing page style:
 * - Large, bold typography
 * - Highlighted text effects
 * - Smooth animations
 * - Glassmorphism design
 * - Mobile responsive
 */
export function OnboardingClient({ locale, user }: OnboardingClientProps) {
  const t = useTranslations("onboarding");

  const [step, setStep] = useState<OnboardingStep>("role");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TUTOR" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student form data
  const [studentData, setStudentData] = useState({
    learningGoal: "",
    currentLevel: "",
    preferredSchedule: "",
    motivation: "",
  });

  // Tutor form data
  const [tutorData, setTutorData] = useState({
    bio: "",
    specialties: [] as string[],
    hourlyRate: "",
    experience: "",
    teachingStyle: "",
    availability: "",
  });

  const handleRoleSelect = (role: "STUDENT" | "TUTOR") => {
    setSelectedRole(role);
    setError(null);
    setIsLoading(true);
    fetch("/api/auth/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setIsLoading(false);
        } else {
          setStep(role === "STUDENT" ? "student-questions" : "tutor-questions");
          setIsLoading(false);
        }
      })
      .catch(() => {
        setError(t("error"));
        setIsLoading(false);
      });
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "STUDENT",
          data: studentData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("error"));
        setIsLoading(false);
        return;
      }

      window.location.href = `/${locale}/dashboard`;
    } catch (err) {
      setError(t("error"));
      setIsLoading(false);
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tutorData.bio || tutorData.bio.length < 50) {
      setError(t("tutor.bioMinLength"));
      return;
    }

    if (tutorData.specialties.length === 0) {
      setError(t("tutor.specialtiesRequired"));
      return;
    }

    if (!tutorData.hourlyRate || parseFloat(tutorData.hourlyRate) < 5) {
      setError(t("tutor.hourlyRateMin"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "TUTOR",
          data: tutorData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("error"));
        setIsLoading(false);
        return;
      }

      window.location.href = `/${locale}/dashboard`;
    } catch (err) {
      setError(t("error"));
      setIsLoading(false);
    }
  };

  const addSpecialty = () => {
    const input = document.getElementById("specialty-input") as HTMLInputElement;
    if (input && input.value.trim() && !tutorData.specialties.includes(input.value.trim())) {
      setTutorData({
        ...tutorData,
        specialties: [...tutorData.specialties, input.value.trim()],
      });
      input.value = "";
    }
  };

  const removeSpecialty = (specialty: string) => {
    setTutorData({
      ...tutorData,
      specialties: tutorData.specialties.filter((s) => s !== specialty),
    });
  };

  return (
    <div className="relative w-full max-w-[700px] px-4 sm:px-6 md:px-0">
      {/* Glassmorphism Form Container */}
      <div className="relative bg-gradient-to-br from-white/95 to-white/85 dark:from-[#1a1a1a]/98 dark:to-[#0a0a0a]/95 backdrop-blur-2xl rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-12 border-2 border-white/80 dark:border-[#262626]/90 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:shadow-[0_40px_100px_rgba(0,0,0,0.12)] dark:sm:shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] rounded-full opacity-25 dark:opacity-20 blur-[80px] bg-[radial-gradient(circle,rgb(255,143,112)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(204,243,129)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-0 left-0 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px] rounded-full opacity-25 dark:opacity-20 blur-[80px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(255,235,59)_0%,rgba(0,0,0,0)_70%)]" />

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 sm:mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] group hover:scale-105 transition-transform">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ccf381] rounded-full mr-2 sm:mr-2.5 animate-pulse" />
            <span className="mr-1.5 sm:mr-2 text-[10px] sm:text-xs">{t("step1")}</span>
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ccf381] opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Progress indicator */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm sm:text-base font-medium text-[#666] dark:text-[#a1a1aa]">
                {step === "role" && t("step1")}
                {(step === "student-questions" || step === "tutor-questions") && t("step2")}
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#111] dark:text-[#ccf381]">
                {step === "role" && "1/2"}
                {(step === "student-questions" || step === "tutor-questions") && "2/2"}
              </span>
            </div>
            <div className="h-2.5 sm:h-3 bg-[#e5e5e5] dark:bg-[#262626] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#111] to-[#222] dark:from-[#ccf381] dark:to-[#d4f89a] rounded-full transition-all duration-500 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                style={{
                  width: step === "role" ? "50%" : "100%",
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl border-red-200 dark:border-red-900/50 bg-red-50/90 dark:bg-red-950/60 backdrop-blur-sm shadow-lg"
            >
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <AlertTitle className="text-sm sm:text-base font-semibold">{error}</AlertTitle>
              <AlertDescription className="text-sm sm:text-base mt-1">{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Role Selection */}
          {step === "role" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 sm:mb-10 md:mb-12 text-center">
                <h1 className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[88px] leading-[0.92] font-bold tracking-[-0.04em] mb-4 sm:mb-6 text-black dark:text-white">
                  {t("role.title")}
                </h1>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#555] dark:text-[#a1a1aa] max-w-[500px] mx-auto">
                  {t("role.description")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("STUDENT")}
                  disabled={isLoading}
                  className="group relative p-8 sm:p-10 md:p-12 rounded-3xl sm:rounded-[40px] border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm hover:border-[#111] dark:hover:border-[#ccf381] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_rgba(204,243,129,0.2)] transition-all duration-300 text-left transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ccf381]/5 to-transparent rounded-3xl sm:rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-4 sm:mb-6 text-[#111] dark:text-[#ccf381] group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-black dark:text-white">
                    {t("role.student")}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-[#666] dark:text-[#a1a1aa] leading-relaxed">
                    {t("role.studentDescription")}
                  </p>
                  <div className="mt-4 sm:mt-6 flex items-center text-[#111] dark:text-[#ccf381] font-semibold text-sm sm:text-base">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("TUTOR")}
                  disabled={isLoading}
                  className="group relative p-8 sm:p-10 md:p-12 rounded-3xl sm:rounded-[40px] border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm hover:border-[#111] dark:hover:border-[#ccf381] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_rgba(204,243,129,0.2)] transition-all duration-300 text-left transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ccf381]/5 to-transparent rounded-3xl sm:rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-4 sm:mb-6 text-[#111] dark:text-[#ccf381] group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-black dark:text-white">
                    {t("role.tutor")}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-[#666] dark:text-[#a1a1aa] leading-relaxed">
                    {t("role.tutorDescription")}
                  </p>
                  <div className="mt-4 sm:mt-6 flex items-center text-[#111] dark:text-[#ccf381] font-semibold text-sm sm:text-base">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {isLoading && (
                <div className="mt-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#111] dark:text-[#ccf381]" />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Student Questions */}
          {step === "student-questions" && (
            <form onSubmit={handleStudentSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 sm:space-y-8">
              <div className="mb-6 sm:mb-8 md:mb-10">
                <h1 className="text-[36px] sm:text-[48px] md:text-[64px] leading-[0.92] font-bold tracking-[-0.04em] mb-4 sm:mb-6 text-black dark:text-white">
                  {t("student.title")}
                </h1>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#555] dark:text-[#a1a1aa]">
                  {t("student.description")}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="learningGoal" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.learningGoal")}
                </Label>
                <Select
                  value={studentData.learningGoal}
                  onValueChange={(value) =>
                    setStudentData({ ...studentData, learningGoal: value })
                  }
                  required
                >
                  <SelectTrigger className="h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg font-medium hover:border-[#111] dark:hover:border-[#ccf381] transition-colors">
                    <SelectValue placeholder={t("student.learningGoalPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversation">{t("student.goals.conversation")}</SelectItem>
                    <SelectItem value="business">{t("student.goals.business")}</SelectItem>
                    <SelectItem value="academic">{t("student.goals.academic")}</SelectItem>
                    <SelectItem value="travel">{t("student.goals.travel")}</SelectItem>
                    <SelectItem value="exam">{t("student.goals.exam")}</SelectItem>
                    <SelectItem value="other">{t("student.goals.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="currentLevel" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.currentLevel")}
                </Label>
                <Select
                  value={studentData.currentLevel}
                  onValueChange={(value) =>
                    setStudentData({ ...studentData, currentLevel: value })
                  }
                  required
                >
                  <SelectTrigger className="h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg font-medium hover:border-[#111] dark:hover:border-[#ccf381] transition-colors">
                    <SelectValue placeholder={t("student.currentLevelPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t("student.levels.beginner")}</SelectItem>
                    <SelectItem value="elementary">{t("student.levels.elementary")}</SelectItem>
                    <SelectItem value="intermediate">{t("student.levels.intermediate")}</SelectItem>
                    <SelectItem value="upper-intermediate">{t("student.levels.upperIntermediate")}</SelectItem>
                    <SelectItem value="advanced">{t("student.levels.advanced")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="preferredSchedule" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.preferredSchedule")}
                </Label>
                <Select
                  value={studentData.preferredSchedule}
                  onValueChange={(value) =>
                    setStudentData({ ...studentData, preferredSchedule: value })
                  }
                  required
                >
                  <SelectTrigger className="h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg font-medium hover:border-[#111] dark:hover:border-[#ccf381] transition-colors">
                    <SelectValue placeholder={t("student.preferredSchedulePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{t("student.schedule.morning")}</SelectItem>
                    <SelectItem value="afternoon">{t("student.schedule.afternoon")}</SelectItem>
                    <SelectItem value="evening">{t("student.schedule.evening")}</SelectItem>
                    <SelectItem value="flexible">{t("student.schedule.flexible")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="motivation" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.motivation")}
                </Label>
                <Textarea
                  id="motivation"
                  value={studentData.motivation}
                  onChange={(e) => setStudentData({ ...studentData, motivation: e.target.value })}
                  placeholder={t("student.motivationPlaceholder")}
                  className="min-h-[120px] sm:min-h-[140px] rounded-2xl sm:rounded-3xl border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555] focus:border-[#111] dark:focus:border-[#ccf381] transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="flex-1 h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#0a0a0a] text-base sm:text-lg font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t("back")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !studentData.learningGoal || !studentData.currentLevel || !studentData.preferredSchedule}
                  className="flex-1 h-12 sm:h-14 rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black font-semibold text-base sm:text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_12px_24px_rgba(204,243,129,0.3)] hover:bg-[#222] dark:hover:bg-[#d4f89a]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    <>
                      {t("complete")}
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Tutor Questions */}
          {step === "tutor-questions" && (
            <form onSubmit={handleTutorSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 sm:space-y-8">
              <div className="mb-6 sm:mb-8 md:mb-10">
                <h1 className="text-[36px] sm:text-[48px] md:text-[64px] leading-[0.92] font-bold tracking-[-0.04em] mb-4 sm:mb-6 text-black dark:text-white">
                  {t("tutor.title")}
                </h1>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[#555] dark:text-[#a1a1aa]">
                  {t("tutor.description")}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="bio" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.bio")} <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Textarea
                  id="bio"
                  value={tutorData.bio}
                  onChange={(e) => setTutorData({ ...tutorData, bio: e.target.value })}
                  placeholder={t("tutor.bioPlaceholder")}
                  required
                  minLength={50}
                  className="min-h-[140px] sm:min-h-[160px] rounded-2xl sm:rounded-3xl border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555] focus:border-[#111] dark:focus:border-[#ccf381] transition-colors"
                />
                <p className="text-xs sm:text-sm text-[#666] dark:text-[#a1a1aa] flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#ccf381]" />
                  {t("tutor.bioHint")}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="specialties" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.specialties")} <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <div className="flex gap-2 sm:gap-3">
                  <Input
                    id="specialty-input"
                    type="text"
                    placeholder={t("tutor.specialtyPlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                    className="flex-1 h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg"
                  />
                  <Button
                    type="button"
                    onClick={addSpecialty}
                    variant="outline"
                    className="h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm px-6 sm:px-8 font-semibold"
                  >
                    {t("tutor.add")}
                  </Button>
                </div>
                {tutorData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
                    {tutorData.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white/90 dark:bg-[#0a0a0a]/90 border-2 border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm sm:text-base font-medium text-black dark:text-white"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="hourlyRate" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.hourlyRate")} <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-lg sm:text-xl font-semibold text-[#666] dark:text-[#a1a1aa]">
                    $
                  </span>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="5"
                    step="0.01"
                    value={tutorData.hourlyRate}
                    onChange={(e) => setTutorData({ ...tutorData, hourlyRate: e.target.value })}
                    placeholder="25.00"
                    required
                    className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg font-medium"
                  />
                </div>
                <p className="text-xs sm:text-sm text-[#666] dark:text-[#a1a1aa] flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#ccf381]" />
                  {t("tutor.hourlyRateHint")}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="experience" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.experience")}
                </Label>
                <Select
                  value={tutorData.experience}
                  onValueChange={(value) => setTutorData({ ...tutorData, experience: value })}
                >
                  <SelectTrigger className="h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg font-medium hover:border-[#111] dark:hover:border-[#ccf381] transition-colors">
                    <SelectValue placeholder={t("tutor.experiencePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">{t("tutor.experienceOptions.0-1")}</SelectItem>
                    <SelectItem value="2-5">{t("tutor.experienceOptions.2-5")}</SelectItem>
                    <SelectItem value="6-10">{t("tutor.experienceOptions.6-10")}</SelectItem>
                    <SelectItem value="10+">{t("tutor.experienceOptions.10+")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label htmlFor="teachingStyle" className="text-sm sm:text-base font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.teachingStyle")}
                </Label>
                <Textarea
                  id="teachingStyle"
                  value={tutorData.teachingStyle}
                  onChange={(e) => setTutorData({ ...tutorData, teachingStyle: e.target.value })}
                  placeholder={t("tutor.teachingStylePlaceholder")}
                  className="min-h-[120px] sm:min-h-[140px] rounded-2xl sm:rounded-3xl border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm text-base sm:text-lg text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555] focus:border-[#111] dark:focus:border-[#ccf381] transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="flex-1 h-12 sm:h-14 rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm hover:bg-white dark:hover:bg-[#0a0a0a] text-base sm:text-lg font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t("back")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !tutorData.bio || tutorData.specialties.length === 0 || !tutorData.hourlyRate}
                  className="flex-1 h-12 sm:h-14 rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black font-semibold text-base sm:text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_12px_24px_rgba(204,243,129,0.3)] hover:bg-[#222] dark:hover:bg-[#d4f89a]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    <>
                      {t("complete")}
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
