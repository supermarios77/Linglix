"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
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
import { AlertCircle, ArrowRight, ArrowLeft, GraduationCap, UserCheck, Loader2 } from "lucide-react";

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
 * Multi-step onboarding flow:
 * 1. Role selection (Student or Tutor)
 * 2. Role-specific questions
 * 3. Profile completion
 */
export function OnboardingClient({ locale, user }: OnboardingClientProps) {
  const t = useTranslations("onboarding");
  const router = useRouter();

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
    // Update user role via API
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

      // Sign in and redirect
      const signInResult = await signIn("credentials", {
        email: user.email,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(t("signInError"));
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err) {
      setError(t("error"));
      setIsLoading(false);
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
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

      // Sign in and redirect
      const signInResult = await signIn("credentials", {
        email: user.email,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(t("signInError"));
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
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
    <div className="relative w-full max-w-[600px] px-4 sm:px-0">
      {/* Glassmorphism Form Container */}
      <div className="relative bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a1a]/95 dark:to-[#0a0a0a]/90 backdrop-blur-2xl rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 border border-white/60 dark:border-[#262626]/80 shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.08)] dark:sm:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full opacity-20 dark:opacity-15 blur-[60px] bg-[radial-gradient(circle,rgb(255,143,112)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(204,243,129)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] rounded-full opacity-20 dark:opacity-15 blur-[60px] bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgb(255,235,59)_0%,rgba(0,0,0,0)_70%)]" />

        <div className="relative z-10">
          {/* Progress indicator */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-[#666] dark:text-[#a1a1aa]">
                {step === "role" && t("step1")}
                {step === "student-questions" && t("step2")}
                {step === "tutor-questions" && t("step2")}
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#666] dark:text-[#a1a1aa]">
                {step === "role" && "1/2"}
                {(step === "student-questions" || step === "tutor-questions") && "2/2"}
              </span>
            </div>
            <div className="h-2 bg-[#e5e5e5] dark:bg-[#262626] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111] dark:bg-[#ccf381] rounded-full transition-all duration-300"
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
              className="mb-5 sm:mb-6 rounded-xl sm:rounded-2xl border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/50 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">{error}</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Role Selection */}
          {step === "role" && (
            <div>
              <div className="mb-8 sm:mb-10">
                <h1 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-3 sm:mb-4 text-black dark:text-white">
                  {t("role.title")}
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa]">
                  {t("role.description")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("STUDENT")}
                  disabled={isLoading}
                  className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm hover:border-[#111] dark:hover:border-[#ccf381] hover:shadow-lg transition-all duration-300 text-left"
                >
                  <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 mb-4 text-[#111] dark:text-[#ccf381] group-hover:scale-110 transition-transform" />
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
                  className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm hover:border-[#111] dark:hover:border-[#ccf381] hover:shadow-lg transition-all duration-300 text-left"
                >
                  <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 mb-4 text-[#111] dark:text-[#ccf381] group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-black dark:text-white">
                    {t("role.tutor")}
                  </h3>
                  <p className="text-sm sm:text-base text-[#666] dark:text-[#a1a1aa]">
                    {t("role.tutorDescription")}
                  </p>
                </button>
              </div>

              {isLoading && (
                <div className="mt-6 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#111] dark:text-[#ccf381]" />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Student Questions */}
          {step === "student-questions" && (
            <form onSubmit={handleStudentSubmit} className="space-y-5 sm:space-y-6">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-3 sm:mb-4 text-black dark:text-white">
                  {t("student.title")}
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa]">
                  {t("student.description")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningGoal" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.learningGoal")}
                </Label>
                <Select
                  value={studentData.learningGoal}
                  onValueChange={(value) =>
                    setStudentData({ ...studentData, learningGoal: value })
                  }
                  required
                >
                  <SelectTrigger className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
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
                <Label htmlFor="currentLevel" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.currentLevel")}
                </Label>
                <Select
                  value={studentData.currentLevel}
                  onValueChange={(value) =>
                    setStudentData({ ...studentData, currentLevel: value })
                  }
                  required
                >
                  <SelectTrigger className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
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
                <Label htmlFor="preferredSchedule" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.preferredSchedule")}
                </Label>
                <Select
                  value={studentData.preferredSchedule}
                  onValueChange={(value) =>
                    setStudentData({ ...studentData, preferredSchedule: value })
                  }
                  required
                >
                  <SelectTrigger className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
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
                <Label htmlFor="motivation" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("student.motivation")}
                </Label>
                <Textarea
                  id="motivation"
                  value={studentData.motivation}
                  onChange={(e) => setStudentData({ ...studentData, motivation: e.target.value })}
                  placeholder={t("student.motivationPlaceholder")}
                  className="min-h-[100px] rounded-2xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="flex-1 h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("back")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !studentData.learningGoal || !studentData.currentLevel || !studentData.preferredSchedule}
                  className="flex-1 h-11 sm:h-12 rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black font-semibold"
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
            <form onSubmit={handleTutorSubmit} className="space-y-5 sm:space-y-6">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.1] font-semibold tracking-[-0.03em] mb-3 sm:mb-4 text-black dark:text-white">
                  {t("tutor.title")}
                </h1>
                <p className="text-base sm:text-lg leading-relaxed text-[#555] dark:text-[#a1a1aa]">
                  {t("tutor.description")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.bio")} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="bio"
                  value={tutorData.bio}
                  onChange={(e) => setTutorData({ ...tutorData, bio: e.target.value })}
                  placeholder={t("tutor.bioPlaceholder")}
                  required
                  minLength={50}
                  className="min-h-[120px] rounded-2xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555]"
                />
                <p className="text-xs text-[#666] dark:text-[#a1a1aa]">
                  {t("tutor.bioHint")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
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
                    className="flex-1 h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    onClick={addSpecialty}
                    variant="outline"
                    className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm"
                  >
                    {t("tutor.add")}
                  </Button>
                </div>
                {tutorData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tutorData.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#0a0a0a]/80 border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="text-[#666] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.hourlyRate")} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] dark:text-[#a1a1aa]">
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
                    className="pl-8 h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm"
                  />
                </div>
                <p className="text-xs text-[#666] dark:text-[#a1a1aa]">
                  {t("tutor.hourlyRateHint")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.experience")}
                </Label>
                <Select
                  value={tutorData.experience}
                  onValueChange={(value) => setTutorData({ ...tutorData, experience: value })}
                >
                  <SelectTrigger className="h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm">
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
                <Label htmlFor="teachingStyle" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("tutor.teachingStyle")}
                </Label>
                <Textarea
                  id="teachingStyle"
                  value={tutorData.teachingStyle}
                  onChange={(e) => setTutorData({ ...tutorData, teachingStyle: e.target.value })}
                  placeholder={t("tutor.teachingStylePlaceholder")}
                  className="min-h-[100px] rounded-2xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm text-black dark:text-white placeholder:text-[#999] dark:placeholder:text-[#555]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="flex-1 h-11 sm:h-12 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("back")}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !tutorData.bio || tutorData.specialties.length === 0 || !tutorData.hourlyRate}
                  className="flex-1 h-11 sm:h-12 rounded-full bg-[#111] dark:bg-[#ccf381] text-white dark:text-black font-semibold"
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
    </div>
  );
}

