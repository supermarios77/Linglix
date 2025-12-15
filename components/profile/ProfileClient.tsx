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
  Info,
  Languages,
  Briefcase,
  Award,
  Heart,
  Target,
  ExternalLink,
  Pencil,
  Upload
} from "lucide-react";
import Image from "next/image";

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
    introduction?: string | null;
    aboutMe?: string | null;
    bio?: string | null;
    languagesKnown?: Array<{ language: string; proficiency: string }> | null;
    languagesTaught?: string[];
    specialties?: string[];
    teachingStyle?: string | null;
    preferredLevels?: string[];
    interests?: string[];
    industryFamiliarity?: string[];
    experience?: string | null;
    workExperience?: string | null;
    degrees?: string | null;
    hourlyRate?: number;
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
  const [introduction, setIntroduction] = useState(tutorProfile?.introduction || "");
  const [aboutMe, setAboutMe] = useState(tutorProfile?.aboutMe || "");
  const [bio, setBio] = useState(tutorProfile?.bio || "");
  const [languagesKnown, setLanguagesKnown] = useState<Array<{ language: string; proficiency: string }>>(
    (tutorProfile?.languagesKnown as any) || []
  );
  const [newLanguage, setNewLanguage] = useState("");
  const [newLanguageProficiency, setNewLanguageProficiency] = useState("FLUENT");
  const [languagesTaught, setLanguagesTaught] = useState<string[]>(tutorProfile?.languagesTaught || []);
  const [newLanguageTaught, setNewLanguageTaught] = useState("");
  const [specialties, setSpecialties] = useState<string[]>(tutorProfile?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [teachingStyle, setTeachingStyle] = useState(tutorProfile?.teachingStyle || "");
  const [preferredLevels, setPreferredLevels] = useState<string[]>(tutorProfile?.preferredLevels || []);
  const [interests, setInterests] = useState<string[]>(tutorProfile?.interests || []);
  const [newInterest, setNewInterest] = useState("");
  const [industryFamiliarity, setIndustryFamiliarity] = useState<string[]>(tutorProfile?.industryFamiliarity || []);
  const [newIndustry, setNewIndustry] = useState("");
  const [experience, setExperience] = useState(tutorProfile?.experience || "");
  const [workExperience, setWorkExperience] = useState(tutorProfile?.workExperience || "");
  const [degrees, setDegrees] = useState(tutorProfile?.degrees || "");
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
    const currentProfile = tutorProfile || {};
    setHasTutorChanges(
      introduction !== (currentProfile.introduction || "") ||
      aboutMe !== (currentProfile.aboutMe || "") ||
      bio !== (currentProfile.bio || "") ||
      JSON.stringify(languagesKnown) !== JSON.stringify((currentProfile.languagesKnown as any) || []) ||
      JSON.stringify(languagesTaught) !== JSON.stringify(currentProfile.languagesTaught || []) ||
      JSON.stringify(specialties) !== JSON.stringify(currentProfile.specialties || []) ||
      teachingStyle !== (currentProfile.teachingStyle || "") ||
      JSON.stringify(preferredLevels) !== JSON.stringify(currentProfile.preferredLevels || []) ||
      JSON.stringify(interests) !== JSON.stringify(currentProfile.interests || []) ||
      JSON.stringify(industryFamiliarity) !== JSON.stringify(currentProfile.industryFamiliarity || []) ||
      experience !== (currentProfile.experience || "") ||
      workExperience !== (currentProfile.workExperience || "") ||
      degrees !== (currentProfile.degrees || "")
    );
  }, [introduction, aboutMe, bio, languagesKnown, languagesTaught, specialties, teachingStyle, preferredLevels, interests, industryFamiliarity, experience, workExperience, degrees, tutorProfile]);

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
          introduction: introduction || null,
          aboutMe: aboutMe || null,
          bio: bio || null,
          languagesKnown: languagesKnown.length > 0 ? languagesKnown : null,
          languagesTaught: languagesTaught,
          specialties,
          teachingStyle: teachingStyle || null,
          preferredLevels: preferredLevels,
          interests: interests,
          industryFamiliarity: industryFamiliarity,
          experience: experience || null,
          workExperience: workExperience || null,
          degrees: degrees || null,
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

  const addLanguageKnown = () => {
    if (newLanguage.trim() && !languagesKnown.some(l => l.language === newLanguage.trim())) {
      setLanguagesKnown([...languagesKnown, { language: newLanguage.trim(), proficiency: newLanguageProficiency }]);
      setNewLanguage("");
      setNewLanguageProficiency("FLUENT");
    }
  };

  const removeLanguageKnown = (index: number) => {
    setLanguagesKnown(languagesKnown.filter((_, i) => i !== index));
  };

  const addLanguageTaught = () => {
    if (newLanguageTaught.trim() && !languagesTaught.includes(newLanguageTaught.trim())) {
      setLanguagesTaught([...languagesTaught, newLanguageTaught.trim()]);
      setNewLanguageTaught("");
    }
  };

  const removeLanguageTaught = (index: number) => {
    setLanguagesTaught(languagesTaught.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !industryFamiliarity.includes(newIndustry.trim())) {
      setIndustryFamiliarity([...industryFamiliarity, newIndustry.trim()]);
      setNewIndustry("");
    }
  };

  const removeIndustry = (index: number) => {
    setIndustryFamiliarity(industryFamiliarity.filter((_, i) => i !== index));
  };

  const togglePreferredLevel = (level: string) => {
    if (preferredLevels.includes(level)) {
      setPreferredLevels(preferredLevels.filter(l => l !== level));
    } else {
      setPreferredLevels([...preferredLevels, level]);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-black dark:text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {t("description")}
          </p>
        </div>
          {user.role === "TUTOR" && (
            <Link
              href={`/${locale}/tutors/${user.name?.toLowerCase().replace(/\s+/g, "-") || "profile"}`}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span>{t("preview")}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Profile Picture & Personal Info */}
          <div className="space-y-8">
            {/* Your Photo Section */}
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white mb-1">
                {t("yourPhoto")}
              </h3>
              <p className="text-sm text-[#666] dark:text-[#888] mb-4">
                {t("photoDescription")}
              </p>
              
              {/* Profile Picture */}
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "Profile"}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
                        <User className="w-12 h-12 text-[#999] dark:text-[#666]" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const response = await fetch("/api/upload/avatar", {
                              method: "POST",
                              body: formData,
                            });
                            if (response.ok) {
                              const { url } = await response.json();
                              await handleImageUpdate(url);
                            }
                          } catch (error) {
                            console.error("Failed to upload image:", error);
                          }
                        }
                      };
                      input.click();
                    }}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors border-2 border-white dark:border-[#0a0a0a]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const response = await fetch("/api/upload/avatar", {
                                method: "POST",
                                body: formData,
                              });
                              if (response.ok) {
                                const { url } = await response.json();
                                await handleImageUpdate(url);
                              }
                            } catch (error) {
                              console.error("Failed to upload image:", error);
                            }
                          }
                        };
                        input.click();
                      }}
                      className="flex-1 border-[#e5e5e5] dark:border-[#262626] hover:border-primary dark:hover:border-accent rounded-xl h-10"
                    >
                      {t("uploadNew")}
                    </Button>
                    <Button
                      onClick={handleSaveUserProfile}
                      disabled={savingUser || !hasUserChanges}
                      className="flex-1 bg-[#111] dark:bg-accent text-white dark:text-black hover:bg-[#222] dark:hover:bg-brand-primary-light disabled:opacity-50 rounded-xl h-10"
                    >
                      {savingUser ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t("save")
                      )}
                    </Button>
                  </div>
                  {(userSuccess || userError) && (
                    <div className="mt-3">
                      {userSuccess && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <CheckCircle2 className="w-4 h-4" />
                          <span>{t("updateSuccess")}</span>
                        </div>
                      )}
                      {userError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>{userError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

            {/* Personal Information */}
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white mb-6">
                {t("personalInformation")}
              </h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t("fullName")}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="h-11 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t("emailAddress")}
                  </Label>
                  <Input
                    value={user.email}
                    disabled
                    className="h-11 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-[#f5f5f5] dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-[#888] dark:text-[#666] mt-1">
                    {t("emailCannotChange")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#444] dark:text-[#a1a1aa]">
                    {t("role")}
                  </Label>
                  <Input
                    value={user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    disabled
                    className="h-11 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-[#f5f5f5] dark:bg-[#0a0a0a] opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bio & Additional Details */}
          <div className="space-y-8">
            {/* Bio Section */}
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white mb-4">
                {t("bio")}
              </h3>
              <Textarea
                value={user.role === "TUTOR" ? (aboutMe || introduction || bio || "") : ""}
                onChange={(e) => {
                  if (user.role === "TUTOR") {
                    setAboutMe(e.target.value);
                  }
                }}
                placeholder={user.role === "TUTOR" ? t("tutor.aboutMePlaceholder") : t("bioPlaceholder")}
                className="min-h-[200px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                rows={8}
              />
            </div>

            {/* Interests/Specialties Section - Only for Tutors */}
            {user.role === "TUTOR" && (
              <div>
                <h3 className="text-base font-semibold text-black dark:text-white mb-4">
                  {t("industryInterests")}
                </h3>
                <div className="space-y-4">
                  {/* Specialties */}
                  <div>
                    <Label className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] mb-2 block">
                      {tTutor("specialties")}
                    </Label>
                    <div className="flex gap-2 mb-3">
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
                        className="h-10 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addSpecialty}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-[#e5e5e5] dark:border-[#262626]"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((specialty, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm"
                          >
                            <span className="text-black dark:text-white">{specialty}</span>
                            <button
                              type="button"
                              onClick={() => removeSpecialty(index)}
                              className="text-[#666] dark:text-[#888] hover:text-black dark:hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interests */}
                  <div>
                    <Label className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] mb-2 block">
                      {t("tutor.interests")}
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterest();
                          }
                        }}
                        placeholder={t("tutor.interestsPlaceholder")}
                        className="h-10 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addInterest}
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-[#e5e5e5] dark:border-[#262626]"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626] rounded-full text-sm"
                          >
                            <span className="text-black dark:text-white">{interest}</span>
                            <button
                              type="button"
                              onClick={() => removeInterest(index)}
                              className="text-[#666] dark:text-[#888] hover:text-black dark:hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {t("addMore")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Profile Section */}
        {user.role === "STUDENT" && (
          <section className="mt-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                  {t("studentProfile")}
                </h2>
                <p className="text-sm text-[#666] dark:text-[#888]">
                  {t("studentProfileDescription")}
                </p>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningGoal" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa]">
                      {tStudent("learningGoal")}
                    </Label>
                    <Select value={learningGoal} onValueChange={setLearningGoal}>
                      <SelectTrigger className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
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
                      <SelectTrigger className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
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
                      <SelectTrigger className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
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
                      className="min-h-[140px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                    rows={5}
                  />
                </div>

                {/* Save Button & Feedback */}
                <div className="pt-6 mt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {studentSuccess && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 animate-in fade-in slide-in-from-top-2">
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
                      className="bg-[#111] dark:bg-accent text-white dark:text-black hover:bg-[#222] dark:hover:bg-brand-primary-light rounded-full px-6 h-11 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
          <section className="mt-12">
            <div className="space-y-8">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                  {t("tutorProfile")}
                </h2>
                <p className="text-sm text-[#666] dark:text-[#888]">
                  {t("tutorProfileDescription")}
                </p>
              </div>

              <div className="space-y-8">
                {/* Introduction & About Me */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="introduction" className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t("tutor.introduction")}
                    </Label>
                    <Textarea
                      id="introduction"
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      placeholder={t("tutor.introductionPlaceholder")}
                      className="min-h-[100px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-[#888] dark:text-[#666]">{t("tutor.introductionHint")}</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="aboutMe" className="text-sm font-medium text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {t("tutor.aboutMe")}
                    </Label>
                    <Textarea
                      id="aboutMe"
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      placeholder={t("tutor.aboutMePlaceholder")}
                      className="min-h-[140px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-sm font-medium text-[#444] dark:text-[#a1a1aa]">
                      {tTutor("bio")} <span className="text-xs font-normal text-muted-foreground">({t("optional")})</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={tTutor("bioPlaceholder")}
                      className="min-h-[120px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                      rows={5}
                    />
                    {bio && (
                      <p className={`text-xs font-medium ${bio.length < 50 ? "text-red-500" : "text-yellow-600 dark:text-yellow-400"}`}>
                        {bio.length}/50 {bio.length >= 50 ? "✓" : ""}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Languages Known */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {t("tutor.languagesKnown")}
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder={t("tutor.languagePlaceholder")}
                      className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] flex-1"
                    />
                    <Select value={newLanguageProficiency} onValueChange={setNewLanguageProficiency}>
                      <SelectTrigger className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white/80 dark:bg-[#0a0a0a]/80 w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NATIVE">{t("tutor.proficiency.native")}</SelectItem>
                        <SelectItem value="FLUENT">{t("tutor.proficiency.fluent")}</SelectItem>
                        <SelectItem value="ADVANCED">{t("tutor.proficiency.advanced")}</SelectItem>
                        <SelectItem value="INTERMEDIATE">{t("tutor.proficiency.intermediate")}</SelectItem>
                        <SelectItem value="BASIC">{t("tutor.proficiency.basic")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={addLanguageKnown}
                      variant="outline"
                      className="rounded-xl border-[#e5e5e5] dark:border-[#262626] hover:border-primary dark:hover:border-accent min-w-[52px] h-12"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {languagesKnown.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {languagesKnown.map((lang, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 rounded-full border border-blue-500/20 dark:border-blue-500/30"
                        >
                          <span className="text-sm font-medium text-black dark:text-white">{lang.language}</span>
                          <span className="text-xs text-[#666] dark:text-[#888]">({t(`tutor.proficiency.${lang.proficiency.toLowerCase()}`)})</span>
                          <button
                            type="button"
                            onClick={() => removeLanguageKnown(index)}
                            className="text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Languages Taught */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {t("tutor.languagesTaught")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newLanguageTaught}
                      onChange={(e) => setNewLanguageTaught(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLanguageTaught();
                        }
                      }}
                      placeholder={t("tutor.languageTaughtPlaceholder")}
                      className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addLanguageTaught}
                      variant="outline"
                      className="rounded-xl border-[#e5e5e5] dark:border-[#262626] hover:border-primary dark:hover:border-accent min-w-[52px] h-12"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {languagesTaught.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {languagesTaught.map((lang, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 dark:from-yellow-500/20 dark:to-yellow-500/10 rounded-full border border-yellow-500/20 dark:border-yellow-500/30"
                        >
                          <span className="text-sm font-medium text-black dark:text-white">{lang}</span>
                          <button
                            type="button"
                            onClick={() => removeLanguageTaught(index)}
                            className="text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Specialties */}
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
                      className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addSpecialty}
                      variant="outline"
                      className="rounded-xl border-[#e5e5e5] dark:border-[#262626] hover:border-primary dark:hover:border-accent min-w-[52px] h-12"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {specialties.map((specialty, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-full border border-primary/20 dark:border-primary/30"
                        >
                          <span className="text-sm font-medium text-black dark:text-white">{specialty}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 transition-colors"
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

                {/* Teaching Style */}
                <div className="space-y-3">
                  <Label htmlFor="teachingStyle" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t("tutor.teachingStyle")}
                  </Label>
                  <Textarea
                    id="teachingStyle"
                    value={teachingStyle}
                    onChange={(e) => setTeachingStyle(e.target.value)}
                    placeholder={t("tutor.teachingStylePlaceholder")}
                      className="min-h-[120px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                    rows={5}
                  />
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Preferred Levels */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {t("tutor.preferredLevels")}
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {["beginner", "elementary", "intermediate", "upper-intermediate", "advanced"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => togglePreferredLevel(level)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          preferredLevels.includes(level)
                            ? "bg-primary text-primary-foreground border-2 border-primary"
                            : "bg-white dark:bg-[#0a0a0a] border-2 border-[#e5e5e5] dark:border-[#262626] text-black dark:text-white hover:border-primary/50"
                        }`}
                      >
                        {tStudent(`levels.${level === "upper-intermediate" ? "upperIntermediate" : level}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Interests */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {t("tutor.interests")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                      placeholder={t("tutor.interestsPlaceholder")}
                      className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addInterest}
                      variant="outline"
                      className="rounded-xl border-[#e5e5e5] dark:border-[#262626] hover:border-primary dark:hover:border-accent min-w-[52px] h-12"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {interests.map((interest, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-pink-500/10 to-pink-500/5 dark:from-pink-500/20 dark:to-pink-500/10 rounded-full border border-pink-500/20 dark:border-pink-500/30"
                        >
                          <span className="text-sm font-medium text-black dark:text-white">{interest}</span>
                          <button
                            type="button"
                            onClick={() => removeInterest(index)}
                            className="text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Industry Familiarity */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {t("tutor.industryFamiliarity")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIndustry();
                        }
                      }}
                      placeholder={t("tutor.industryPlaceholder")}
                      className="h-12 rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addIndustry}
                      variant="outline"
                      className="rounded-xl border-[#e5e5e5] dark:border-[#262626] hover:border-primary dark:hover:border-accent min-w-[52px] h-12"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {industryFamiliarity.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {industryFamiliarity.map((industry, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/10 rounded-full border border-purple-500/20 dark:border-purple-500/30"
                        >
                          <span className="text-sm font-medium text-black dark:text-white">{industry}</span>
                          <button
                            type="button"
                            onClick={() => removeIndustry(index)}
                            className="text-[#888] dark:text-[#666] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Experience & Training */}
                <div className="space-y-3">
                  <Label htmlFor="experience" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {t("tutor.experience")} <span className="text-xs font-normal text-muted-foreground">({t("optional")})</span>
                  </Label>
                  <Textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder={t("tutor.experiencePlaceholder")}
                      className="min-h-[120px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                    rows={5}
                  />
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Work Experience */}
                <div className="space-y-3">
                  <Label htmlFor="workExperience" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {t("tutor.workExperience")} <span className="text-xs font-normal text-muted-foreground">({t("optional")})</span>
                  </Label>
                  <Textarea
                    id="workExperience"
                    value={workExperience}
                    onChange={(e) => setWorkExperience(e.target.value)}
                    placeholder={t("tutor.workExperiencePlaceholder")}
                      className="min-h-[120px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                    rows={5}
                  />
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Degrees */}
                <div className="space-y-3">
                  <Label htmlFor="degrees" className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {t("tutor.degrees")} <span className="text-xs font-normal text-muted-foreground">({t("optional")})</span>
                  </Label>
                  <Textarea
                    id="degrees"
                    value={degrees}
                    onChange={(e) => setDegrees(e.target.value)}
                    placeholder={t("tutor.degreesPlaceholder")}
                      className="min-h-[100px] rounded-xl border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] focus:border-primary dark:focus:border-accent resize-none"
                    rows={4}
                  />
                </div>

                <Separator className="bg-[#e5e5e5] dark:bg-[#262626]" />

                {/* Pricing Info (Read-only) */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#444] dark:text-[#a1a1aa] flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t("tutor.pricing")}
                  </Label>
                  <div className="p-4 rounded-xl bg-[#f5f5f5] dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626]">
                    <p className="text-sm text-black dark:text-white mb-2">
                      <span className="font-semibold">${tutorProfile?.hourlyRate || 30}/hour</span> - {t("tutor.studentRate")}
                    </p>
                    <p className="text-xs text-[#666] dark:text-[#888]">
                      {t("tutor.tutorEarnings")}: <span className="font-medium">$15/hour</span> ({t("tutor.afterCommission")})
                    </p>
                  </div>
                </div>

                {/* Save Button & Feedback */}
                <div className="pt-6 mt-6 border-t border-[#e5e5e5] dark:border-[#262626]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {tutorSuccess && (
                        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 animate-in fade-in slide-in-from-top-2">
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
                      className="bg-[#111] dark:bg-accent text-white dark:text-black hover:bg-[#222] dark:hover:bg-brand-primary-light rounded-full px-6 h-11 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
