"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowRight, ArrowLeft, GraduationCap, UserCheck, Loader2, X } from "lucide-react";

interface OnboardingClientProps {
  locale: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
  };
}

type OnboardingStep = "role" | "student-questions" | "tutor-questions";

/**
 * Onboarding Client Component
 *
 * Clean, production-ready onboarding flow with:
 * - Clean, professional design
 * - Smooth transitions
 * - Proper form validation
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
  });

  const handleRoleSelect = (role: "STUDENT" | "TUTOR") => {
    setSelectedRole(role);
    setError(null);
    // Just move to the next step - we'll update the role when completing onboarding
    setStep(role === "STUDENT" ? "student-questions" : "tutor-questions");
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

      // Redirect to tutor selection page
      window.location.href = `/${locale}/onboarding/select-tutor`;
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
    <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-6">
      {/* Main Container */}
      <div className="relative bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 border border-[#e5e5e5] dark:border-[#262626] shadow-xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#666] dark:text-[#a1a1aa]">
              {step === "role" ? t("step1") : t("step2")}
            </span>
            <span className="text-sm font-medium text-[#111] dark:text-[#ccf381]">
              {step === "role" ? "1/2" : "2/2"}
            </span>
          </div>
          <div className="h-2 bg-[#e5e5e5] dark:bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#111] dark:bg-[#ccf381] rounded-full transition-all duration-500"
              style={{
                width: step === "role" ? "50%" : "100%",
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-black dark:text-white">
                {t("role.title")}
              </h1>
              <p className="text-base sm:text-lg text-[#666] dark:text-[#a1a1aa]">
                {t("role.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <button
                type="button"
                onClick={() => handleRoleSelect("STUDENT")}
                disabled={isLoading}
                className="group relative p-6 sm:p-8 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] hover:border-[#111] dark:hover:border-[#ccf381] transition-all duration-200 text-left"
              >
                <GraduationCap className="w-10 h-10 mb-4 text-[#111] dark:text-[#ccf381]" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-black dark:text-white">
                  {t("role.student")}
                </h3>
                <p className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa]">
                  {t("role.studentDescription")}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("TUTOR")}
                disabled={isLoading}
                className="group relative p-6 sm:p-8 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] hover:border-[#111] dark:hover:border-[#ccf381] transition-all duration-200 text-left"
              >
                <UserCheck className="w-10 h-10 mb-4 text-[#111] dark:text-[#ccf381]" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-black dark:text-white">
                  {t("role.tutor")}
                </h3>
                <p className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa]">
                  {t("role.tutorDescription")}
                </p>
              </button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#111] dark:text-[#ccf381]" />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Student Questions */}
        {step === "student-questions" && (
          <form onSubmit={handleStudentSubmit} className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-black dark:text-white">
                {t("student.title")}
              </h1>
              <p className="text-base text-[#666] dark:text-[#a1a1aa]">
                {t("student.description")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningGoal" className="text-sm font-semibold">
                {t("student.learningGoal")}
              </Label>
              <Select
                value={studentData.learningGoal}
                onValueChange={(value) =>
                  setStudentData({ ...studentData, learningGoal: value })
                }
                required
              >
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="currentLevel" className="text-sm font-semibold">
                {t("student.currentLevel")}
              </Label>
              <Select
                value={studentData.currentLevel}
                onValueChange={(value) =>
                  setStudentData({ ...studentData, currentLevel: value })
                }
                required
              >
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="preferredSchedule" className="text-sm font-semibold">
                {t("student.preferredSchedule")}
              </Label>
              <Select
                value={studentData.preferredSchedule}
                onValueChange={(value) =>
                  setStudentData({ ...studentData, preferredSchedule: value })
                }
                required
              >
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="motivation" className="text-sm font-semibold">
                {t("student.motivation")}
              </Label>
              <Textarea
                id="motivation"
                value={studentData.motivation}
                onChange={(e) => setStudentData({ ...studentData, motivation: e.target.value })}
                placeholder={t("student.motivationPlaceholder")}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("role")}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("back")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !studentData.learningGoal || !studentData.currentLevel || !studentData.preferredSchedule}
                className="flex-1 bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {t("complete")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Tutor Questions */}
        {step === "tutor-questions" && (
          <form onSubmit={handleTutorSubmit} className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-black dark:text-white">
                {t("tutor.title")}
              </h1>
              <p className="text-base text-[#666] dark:text-[#a1a1aa]">
                {t("tutor.description")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold">
                {t("tutor.bio")} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                value={tutorData.bio}
                onChange={(e) => setTutorData({ ...tutorData, bio: e.target.value })}
                placeholder={t("tutor.bioPlaceholder")}
                required
                minLength={50}
                className="min-h-[120px]"
              />
              <p className="text-xs text-[#666] dark:text-[#a1a1aa]">
                {t("tutor.bioHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties" className="text-sm font-semibold">
                {t("tutor.specialties")} <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
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
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addSpecialty}
                  variant="outline"
                >
                  {t("tutor.add")}
                </Button>
              </div>
              {tutorData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tutorData.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm"
                    >
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="text-sm font-semibold">
                {t("tutor.hourlyRate")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] dark:text-[#a1a1aa]">
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
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[#666] dark:text-[#a1a1aa]">
                {t("tutor.hourlyRateHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-semibold">
                {t("tutor.experience")}
              </Label>
              <Select
                value={tutorData.experience}
                onValueChange={(value) => setTutorData({ ...tutorData, experience: value })}
              >
                <SelectTrigger className="h-11">
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

            <div className="space-y-2">
              <Label htmlFor="teachingStyle" className="text-sm font-semibold">
                {t("tutor.teachingStyle")}
              </Label>
              <Textarea
                id="teachingStyle"
                value={tutorData.teachingStyle}
                onChange={(e) => setTutorData({ ...tutorData, teachingStyle: e.target.value })}
                placeholder={t("tutor.teachingStylePlaceholder")}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("role")}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("back")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !tutorData.bio || tutorData.specialties.length === 0 || !tutorData.hourlyRate}
                className="flex-1 bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {t("complete")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
