"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "./AvatarUpload";
import { ArrowLeft, CheckCircle2, Loader2, X, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  // Student profile state
  const [learningGoal, setLearningGoal] = useState(studentProfile?.learningGoal || "");
  const [currentLevel, setCurrentLevel] = useState(studentProfile?.currentLevel || "");
  const [preferredSchedule, setPreferredSchedule] = useState(studentProfile?.preferredSchedule || "");
  const [motivation, setMotivation] = useState(studentProfile?.motivation || "");
  const [savingStudent, setSavingStudent] = useState(false);
  const [studentSuccess, setStudentSuccess] = useState(false);

  // Tutor profile state
  const [bio, setBio] = useState(tutorProfile?.bio || "");
  const [specialties, setSpecialties] = useState<string[]>(tutorProfile?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [hourlyRate, setHourlyRate] = useState(tutorProfile?.hourlyRate?.toString() || "");
  const [savingTutor, setSavingTutor] = useState(false);
  const [tutorSuccess, setTutorSuccess] = useState(false);

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
      setTimeout(() => setUserSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSavingUser(false);
    }
  };

  const handleSaveStudentProfile = async () => {
    setSavingStudent(true);
    setStudentSuccess(false);

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
      setTimeout(() => setStudentSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error("Failed to update student profile:", error);
      alert(error instanceof Error ? error.message : "Failed to update student profile");
    } finally {
      setSavingStudent(false);
    }
  };

  const handleSaveTutorProfile = async () => {
    if (bio && bio.length < 50) {
      alert(tTutor("bioMinLength"));
      return;
    }

    if (specialties.length === 0) {
      alert(tTutor("specialtiesRequired"));
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 5) {
      alert(tTutor("hourlyRateMin"));
      return;
    }

    setSavingTutor(true);
    setTutorSuccess(false);

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
      setTimeout(() => setTutorSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error("Failed to update tutor profile:", error);
      alert(error instanceof Error ? error.message : "Failed to update tutor profile");
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
          <Button variant="outline" className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border rounded-full">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{tCommon("backToDashboard")}</span>
            <span className="sm:hidden">{tCommon("back")}</span>
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 pt-24 sm:pt-28">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-black dark:text-white">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {t("description")}
          </p>
        </div>

        {/* Profile Picture */}
        <Card className="mb-6 bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#e5e5e5] dark:border-[#262626] rounded-[24px] sm:rounded-[32px]">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              {t("profilePicture")}
            </CardTitle>
            <CardDescription className="text-[#666] dark:text-[#a1a1aa]">
              {t("profilePictureDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <AvatarUpload
              currentImage={user.image}
              onImageUpdate={handleImageUpdate}
            />
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card className="mb-6 bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#e5e5e5] dark:border-[#262626] rounded-[24px] sm:rounded-[32px]">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              {t("accountInfo")}
            </CardTitle>
            <CardDescription className="text-[#666] dark:text-[#a1a1aa]">
              {t("accountInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                {t("name")}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm focus:border-[#999] dark:focus:border-[#ccf381] focus:ring-2 focus:ring-[#999]/10 dark:focus:ring-[#ccf381]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                {t("email")}
              </Label>
              <Input
                value={user.email}
                disabled
                className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-[#f5f5f5] dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-[#888] dark:text-[#666]">{t("emailCannotChange")}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                {t("role")}
              </Label>
              <Input
                value={user.role.toLowerCase()}
                disabled
                className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-[#f5f5f5] dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed capitalize"
              />
            </div>
            <Button
              onClick={handleSaveUserProfile}
              disabled={savingUser || name === user.name}
              className="w-full sm:w-auto bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] rounded-full"
            >
              {savingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                t("saveChanges")
              )}
            </Button>
            {userSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                {t("updateSuccess")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Profile */}
        {user.role === "STUDENT" && (
          <Card className="mb-6 bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#e5e5e5] dark:border-[#262626] rounded-[24px] sm:rounded-[32px]">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                {t("studentProfile")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#a1a1aa]">
                {t("studentProfileDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="learningGoal" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {tStudent("learningGoal")}
                </Label>
                <Select value={learningGoal} onValueChange={setLearningGoal}>
                  <SelectTrigger className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80">
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
                  <SelectTrigger className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80">
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
                  <SelectTrigger className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80">
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

              <div className="space-y-2">
                <Label htmlFor="motivation" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {tStudent("motivation")}
                </Label>
                <Textarea
                  id="motivation"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder={tStudent("motivationPlaceholder")}
                  className="min-h-[100px] rounded-2xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSaveStudentProfile}
                disabled={savingStudent}
                className="w-full sm:w-auto bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] rounded-full"
              >
                {savingStudent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveChanges")
                )}
              </Button>
              {studentSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("updateSuccess")}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tutor Profile */}
        {user.role === "TUTOR" && (
          <Card className="mb-6 bg-white dark:bg-gradient-to-b from-[#1a1a1a] to-[#121212] border border-[#e5e5e5] dark:border-[#262626] rounded-[24px] sm:rounded-[32px]">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                {t("tutorProfile")}
              </CardTitle>
              <CardDescription className="text-[#666] dark:text-[#a1a1aa]">
                {t("tutorProfileDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {tTutor("bio")}
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={tTutor("bioPlaceholder")}
                  className="min-h-[120px] rounded-2xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80"
                  rows={5}
                />
                <p className="text-xs text-[#888] dark:text-[#666]">{tTutor("bioHint")}</p>
                {bio && (
                  <p className={`text-xs ${bio.length < 50 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                    {bio.length}/50 characters minimum
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
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
                    className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80"
                  />
                  <Button
                    type="button"
                    onClick={addSpecialty}
                    variant="outline"
                    className="rounded-full border-[#e5e5e5] dark:border-[#262626]"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specialties.map((specialty, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] dark:bg-[#1a1a1a] rounded-full border border-[#e5e5e5] dark:border-[#262626]"
                      >
                        <span className="text-sm text-black dark:text-white">{specialty}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                  {tTutor("hourlyRate")}
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="5"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="h-11 rounded-full border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80"
                />
                <p className="text-xs text-[#888] dark:text-[#666]">{tTutor("hourlyRateHint")}</p>
              </div>

              <Button
                onClick={handleSaveTutorProfile}
                disabled={savingTutor}
                className="w-full sm:w-auto bg-[#111] dark:bg-[#ccf381] text-white dark:text-black hover:bg-[#222] dark:hover:bg-[#d4f89a] rounded-full"
              >
                {savingTutor ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveChanges")
                )}
              </Button>
              {tutorSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {t("updateSuccess")}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
