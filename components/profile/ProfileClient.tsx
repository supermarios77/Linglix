"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "./AvatarUpload";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  X, 
  Plus, 
  User, 
  Mail, 
  Shield,
  GraduationCap,
  BookOpen,
  DollarSign,
  Sparkles,
  Save,
  AlertCircle,
  Info
} from "lucide-react";

interface ProfileClientProps {
  locale: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: string;
  };
  studentProfile?: {
    learningGoal: string | null;
    currentLevel: string | null;
    preferredSchedule: string | null;
    motivation: string | null;
  } | null;
  tutorProfile?: {
    bio: string | null;
    specialties: string[];
    hourlyRate: number;
  } | null;
}

export function ProfileClient({ locale, user, studentProfile, tutorProfile }: ProfileClientProps) {
  const t = useTranslations("profile");
  const tStudent = useTranslations("onboarding.student");
  const tTutor = useTranslations("onboarding.tutor");
  const tCommon = useTranslations("common");
  const router = useRouter();

  // User profile state
  const [name, setName] = useState(user.name || "");
  const [savingUser, setSavingUser] = useState(false);
  const [userSuccess, setUserSuccess] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [hasUserChanges, setHasUserChanges] = useState(false);

  // Student profile state
  const [learningGoal, setLearningGoal] = useState(studentProfile?.learningGoal || "");
  const [currentLevel, setCurrentLevel] = useState(studentProfile?.currentLevel || "");
  const [preferredSchedule, setPreferredSchedule] = useState(studentProfile?.preferredSchedule || "");
  const [motivation, setMotivation] = useState(studentProfile?.motivation || "");
  const [savingStudent, setSavingStudent] = useState(false);
  const [studentSuccess, setStudentSuccess] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [hasStudentChanges, setHasStudentChanges] = useState(false);

  // Tutor profile state
  const [bio, setBio] = useState(tutorProfile?.bio || "");
  const [specialties, setSpecialties] = useState<string[]>(tutorProfile?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [hourlyRate, setHourlyRate] = useState(tutorProfile?.hourlyRate?.toString() || "");
  const [savingTutor, setSavingTutor] = useState(false);
  const [tutorSuccess, setTutorSuccess] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [hasTutorChanges, setHasTutorChanges] = useState(false);

  // Track changes
  useEffect(() => {
    setHasUserChanges(name !== (user.name || ""));
  }, [name, user.name]);

  useEffect(() => {
    setHasStudentChanges(
      learningGoal !== (studentProfile?.learningGoal || "") ||
      currentLevel !== (studentProfile?.currentLevel || "") ||
      preferredSchedule !== (studentProfile?.preferredSchedule || "") ||
      motivation !== (studentProfile?.motivation || "")
    );
  }, [learningGoal, currentLevel, preferredSchedule, motivation, studentProfile]);

  useEffect(() => {
    setHasTutorChanges(
      bio !== (tutorProfile?.bio || "") ||
      JSON.stringify(specialties) !== JSON.stringify(tutorProfile?.specialties || []) ||
      hourlyRate !== (tutorProfile?.hourlyRate?.toString() || "")
    );
  }, [bio, specialties, hourlyRate, tutorProfile]);

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/user/image", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile picture");
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to update image:", error);
      throw error;
    }
  };

  const handleSaveUserProfile = async () => {
    setSavingUser(true);
    setUserSuccess(false);
    setUserError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setUserSuccess(true);
      setHasUserChanges(false);
      setTimeout(() => setUserSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "Failed to update profile");
      setTimeout(() => setUserError(null), 5000);
    } finally {
      setSavingUser(false);
    }
  };

  const handleSaveStudentProfile = async () => {
    setSavingStudent(true);
    setStudentSuccess(false);
    setStudentError(null);

    try {
      const response = await fetch("/api/user/student-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learningGoal: learningGoal || null,
          currentLevel: currentLevel || null,
          preferredSchedule: preferredSchedule || null,
          motivation: motivation || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update student profile");
      }

      setStudentSuccess(true);
      setHasStudentChanges(false);
      setTimeout(() => setStudentSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      setStudentError(error instanceof Error ? error.message : "Failed to update student profile");
      setTimeout(() => setStudentError(null), 5000);
    } finally {
      setSavingStudent(false);
    }
  };

  const handleSaveTutorProfile = async () => {
    if (bio && bio.length < 50) {
      setTutorError(tTutor("bioMinLength"));
      setTimeout(() => setTutorError(null), 5000);
      return;
    }

    if (specialties.length === 0) {
      setTutorError(tTutor("specialtiesRequired"));
      setTimeout(() => setTutorError(null), 5000);
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 5) {
      setTutorError(tTutor("hourlyRateMin"));
      setTimeout(() => setTutorError(null), 5000);
      return;
    }

    setSavingTutor(true);
    setTutorSuccess(false);
    setTutorError(null);

    try {
      const response = await fetch("/api/user/tutor-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: bio || null,
          specialties,
          hourlyRate: rate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tutor profile");
      }

      setTutorSuccess(true);
      setHasTutorChanges(false);
      setTimeout(() => setTutorSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      setTutorError(error instanceof Error ? error.message : "Failed to update tutor profile");
      setTimeout(() => setTutorError(null), 5000);
    } finally {
      setSavingTutor(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505]">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 md:px-12 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <Link
          href={`/${locale}`}
          className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          Linglix<span className="text-brand-primary">.</span>
        </Link>

        <Link href={`/${locale}/dashboard`}>
          <Button variant="outline" className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border rounded-full hover:border-primary/50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>{tCommon("backToDashboard")}</span>
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Page Header */}
        <div className="mb-12 sm:mb-16">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-card/90 dark:bg-card/90 backdrop-blur-md border border-border rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3 h-3 mr-2 text-brand-primary" />
            <span>{t("editProfile")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-black dark:text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Profile Picture & Basic Info Section */}
        <section className="mb-16 sm:mb-20">
          <div className="bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-2xl sm:rounded-3xl border border-[#e5e5e5] dark:border-[#262626] shadow-sm p-6 sm:p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {t("profilePicture")}
                </h2>
                <p className="text-sm text-[#666] dark:text-[#a1a1aa] mt-0.5">
                  {t("profilePictureDescription")}
                </p>
              </div>
            </div>
            
            <div className="mb-10">
              <AvatarUpload
                currentImage={user.image}
                onImageUpdate={handleImageUpdate}
              />
            </div>

            <Separator className="my-10 bg-[#e5e5e5] dark:bg-[#262626]" />

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                    {t("accountInfo")}
                  </h2>
                  <p className="text-sm text-[#666] dark:text-[#a1a1aa] mt-0.5">
                    {t("accountInfoDescription")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                    {t("name")}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm focus:border-primary dark:focus:border-[#ccf381] focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#ccf381]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                    {t("email")}
                  </Label>
                  <Input
                    value={user.email}
                    disabled
                    className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-[#f5f5f5] dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-[#888] dark:text-[#666] flex items-center gap-1.5 mt-1.5">
                    <Info className="w-3.5 h-3.5" />
                    {t("emailCannotChange")}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {t("role")}
                </Label>
                <Input
                  value={user.role.toLowerCase()}
                  disabled
                  className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-[#f5f5f5] dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed capitalize"
                />
              </div>

              {/* Save Button & Feedback */}
              <div className="pt-6 mt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {userSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{t("updateSuccess")}</span>
                      </div>
                    )}
                    {userError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">{userError}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSaveUserProfile}
                    disabled={savingUser || !hasUserChanges}
                    className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] rounded-full px-6 h-11 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {savingUser ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t("saveChanges")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Profile Section */}
        {user.role === "STUDENT" && (
          <section className="mb-16 sm:mb-20">
            <div className="bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-2xl sm:rounded-3xl border border-[#e5e5e5] dark:border-[#262626] shadow-sm p-6 sm:p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                    {t("studentProfile")}
                  </h2>
                  <p className="text-sm text-[#666] dark:text-[#a1a1aa] mt-0.5">
                    {t("studentProfileDescription")}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningGoal" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                      {tStudent("learningGoal")}
                    </Label>
                    <Select value={learningGoal} onValueChange={setLearningGoal}>
                      <SelectTrigger className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80">
                        <SelectValue placeholder={tStudent("learningGoalPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversation">{tStudent("goals.conversation")}</SelectItem>
                        <SelectItem value="business">{tStudent("goals.business")}</SelectItem>
                        <SelectItem value="academic">{tStudent("goals.academic")}</SelectItem>
                        <SelectItem value="travel">{tStudent("goals.travel")}</SelectItem>
                        <SelectItem value="exam">{tStudent("goals.exam")}</SelectItem>
                        <SelectItem value="other">{tStudent("goals.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentLevel" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                      {tStudent("currentLevel")}
                    </Label>
                    <Select value={currentLevel} onValueChange={setCurrentLevel}>
                      <SelectTrigger className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80">
                        <SelectValue placeholder={tStudent("currentLevelPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{tStudent("levels.beginner")}</SelectItem>
                        <SelectItem value="elementary">{tStudent("levels.elementary")}</SelectItem>
                        <SelectItem value="intermediate">{tStudent("levels.intermediate")}</SelectItem>
                        <SelectItem value="upper-intermediate">{tStudent("levels.upperIntermediate")}</SelectItem>
                        <SelectItem value="advanced">{tStudent("levels.advanced")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredSchedule" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                      {tStudent("preferredSchedule")}
                    </Label>
                    <Select value={preferredSchedule} onValueChange={setPreferredSchedule}>
                      <SelectTrigger className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80">
                        <SelectValue placeholder={tStudent("preferredSchedulePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">{tStudent("schedule.morning")}</SelectItem>
                        <SelectItem value="afternoon">{tStudent("schedule.afternoon")}</SelectItem>
                        <SelectItem value="evening">{tStudent("schedule.evening")}</SelectItem>
                        <SelectItem value="flexible">{tStudent("schedule.flexible")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {tStudent("motivation")}
                    <span className="text-xs font-normal text-muted-foreground">({t("optional")})</span>
                  </Label>
                  <Textarea
                    id="motivation"
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder={tStudent("motivationPlaceholder")}
                    className="min-h-[140px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 focus:border-primary dark:focus:border-[#ccf381] focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#ccf381]/20 transition-all resize-none"
                    rows={5}
                  />
                </div>

                {/* Save Button & Feedback */}
                <div className="pt-6 mt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {studentSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{t("updateSuccess")}</span>
                        </div>
                      )}
                      {studentError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="truncate">{studentError}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleSaveStudentProfile}
                      disabled={savingStudent || !hasStudentChanges}
                      className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] rounded-full px-6 h-11 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {savingStudent ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t("saveChanges")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tutor Profile Section */}
        {user.role === "TUTOR" && (
          <section className="mb-16 sm:mb-20">
            <div className="bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] rounded-2xl sm:rounded-3xl border border-[#e5e5e5] dark:border-[#262626] shadow-sm p-6 sm:p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-green-500/10 dark:bg-green-500/20 rounded-xl">
                  <BookOpen className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                    {t("tutorProfile")}
                  </h2>
                  <p className="text-sm text-[#666] dark:text-[#a1a1aa] mt-0.5">
                    {t("tutorProfileDescription")}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                    {tTutor("bio")}
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={tTutor("bioPlaceholder")}
                    className="min-h-[160px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 focus:border-primary dark:focus:border-[#ccf381] focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#ccf381]/20 transition-all resize-none"
                    rows={6}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-[#888] dark:text-[#666] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {tTutor("bioHint")}
                    </p>
                    <p className={`text-xs font-medium ${bio.length < 50 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                      {bio.length}/50 {bio.length >= 50 ? "✓" : ""}
                    </p>
                  </div>
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {tTutor("specialties")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSpecialty();
                        }
                      }}
                      placeholder={tTutor("specialtyPlaceholder")}
                      className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 focus:border-primary dark:focus:border-[#ccf381] focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#ccf381]/20 transition-all"
                    />
                    <Button
                      type="button"
                      onClick={addSpecialty}
                      variant="outline"
                      className="rounded-xl border-[#e5e5e5] dark:border-[#262626] hover:border-primary dark:hover:border-[#ccf381] min-w-[52px] h-12"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {specialties.map((specialty, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full border border-primary/20 dark:border-primary/30 hover:border-primary/40 transition-colors"
                        >
                          <span className="text-sm font-medium text-black dark:text-white">{specialty}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            aria-label={`Remove ${specialty}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {specialties.length === 0 && (
                    <p className="text-xs text-[#888] dark:text-[#666] flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {tTutor("specialtiesRequired")}
                    </p>
                  )}
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                <div className="space-y-3">
                  <Label htmlFor="hourlyRate" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {tTutor("hourlyRate")}
                  </Label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] dark:text-[#888] font-medium text-base">$</span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="5"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="0.00"
                      className="h-12 pl-8 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 focus:border-primary dark:focus:border-[#ccf381] focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#ccf381]/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-[#888] dark:text-[#666] flex items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5" />
                    {tTutor("hourlyRateHint")}
                  </p>
                </div>

                {/* Save Button & Feedback */}
                <div className="pt-6 mt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {tutorSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{t("updateSuccess")}</span>
                        </div>
                      )}
                      {tutorError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="truncate">{tutorError}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleSaveTutorProfile}
                      disabled={savingTutor || !hasTutorChanges}
                      className="bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] rounded-full px-6 h-11 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {savingTutor ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t("saveChanges")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
