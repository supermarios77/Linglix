"use client";

/**
 * Video Call Client Component
 * 
 * Production-ready video call interface using Stream Video SDK.
 * Features:
 * - Join/leave call functionality
 * - Audio/video controls
 * - Screen sharing
 * - Participant view
 * - Call status and timer
 * - Error handling and recovery
 * - Responsive design matching Linglix style
 * 
 * Based on Stream Video SDK best practices:
 * https://getstream.io/video/docs/react/
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  StreamCall,
  useCallStateHooks,
  SpeakerLayout,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  CancelCallButton,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Call } from "@stream-io/video-react-sdk";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";

// Import Stream CSS for default styling
import "@stream-io/video-react-sdk/dist/css/styles.css";

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: string;
}

interface OtherParticipant {
  id: string;
  name: string;
  image: string | null;
}

interface VideoCallClientProps {
  callId: string;
  locale: string;
  user: User;
  otherParticipant: OtherParticipant;
  isTutor: boolean;
}

/**
 * Main Video Call Client Component
 */
export function VideoCallClient({
  callId,
  locale,
  user,
  otherParticipant,
  isTutor,
}: VideoCallClientProps) {
  const router = useRouter();
  const t = useTranslations("videoCall");
  const tCommon = useTranslations("common");

  const [call, setCall] = useState<Call | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const callStartTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get Stream client from context (provided by StreamVideoProvider)
  const streamClient = useStreamVideoClient();

  // Initialize call using Stream client from context
  useEffect(() => {
    // Wait for client to be ready
    if (!streamClient) {
      // Client not ready yet, keep showing loading state
      return;
    }

    let mounted = true;
    let callInstance: Call | null = null;

    const initializeCall = async () => {
      try {
        // Create call instance
        const callType = "default"; // 1-on-1 tutoring calls
        callInstance = streamClient.call(callType, callId);

        // Join the call (create if it doesn't exist)
        // SDK will retry up to 3 times by default
        await callInstance.join({ create: true });
        
        if (!mounted) {
          // Component unmounted during join, leave the call
          await callInstance.leave().catch(console.error);
          return;
        }
        
        setCall(callInstance);
        setIsJoining(false);
        callStartTimeRef.current = new Date();
        
        // Start duration timer
        durationIntervalRef.current = setInterval(() => {
          if (callStartTimeRef.current && mounted) {
            const elapsed = Math.floor(
              (new Date().getTime() - callStartTimeRef.current.getTime()) / 1000
            );
            setCallDuration(elapsed);
          }
        }, 1000);
      } catch (err) {
        // Enhanced error handling following Stream SDK best practices
        let errorMessage = "Failed to join video call. Please try again.";
        
        if (err instanceof Error) {
          // Handle specific error types
          if (err.name === "NotAllowedError" || err.message.includes("permission")) {
            errorMessage = "Camera or microphone permission denied. Please grant permissions and try again.";
          } else if (err.message.includes("network") || err.message.includes("connection")) {
            errorMessage = "Network error. Please check your connection and try again.";
          } else if (err.message.includes("token") || err.message.includes("authentication")) {
            errorMessage = "Authentication error. Please refresh the page and try again.";
          } else {
            errorMessage = err.message || errorMessage;
          }
          
          // Log error for debugging (only in development)
          if (process.env.NODE_ENV === "development") {
            console.error("Error joining call:", err);
          }
        }
        
        if (mounted) {
          setError(errorMessage);
          setIsJoining(false);
        }
      }
    };

    initializeCall();

    return () => {
      mounted = false;
      
      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      // Leave call on cleanup (if it was created)
      if (callInstance) {
        callInstance.leave().catch((err) => {
          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.error("Error leaving call on cleanup:", err);
          }
        });
      }
    };
  }, [callId, streamClient]);

  // Handle leaving call
  const handleLeaveCall = useCallback(async () => {
    try {
      if (call) {
        await call.leave();
      }
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      console.error("Error leaving call:", err);
      // Still redirect even if leave fails
      router.push(`/${locale}/dashboard`);
    }
  }, [call, router, locale]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if Stream is configured
  if (!streamClient) {
    // If client is not available, it might be because Stream is not configured
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="p-8 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-red-500/50 dark:border-red-500/30 rounded-2xl max-w-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-black dark:text-white">
                {t("errorTitle")}
              </h2>
              <p className="text-sm text-[#666] dark:text-[#aaa]">
                Stream video service is not configured. Please contact support.
              </p>
              <Button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="mt-4"
              >
                {tCommon("backToDashboard")}
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    
    // Otherwise, show loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#ccf381]" />
            <p className="text-lg font-medium text-black dark:text-white">
              {t("connecting")}
            </p>
            <p className="text-sm text-[#666] dark:text-[#aaa]">
              Initializing video client...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state - show while joining call
  if (isJoining) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#ccf381]" />
            <p className="text-lg font-medium text-black dark:text-white">
              {t("joining")}
            </p>
            <p className="text-sm text-[#666] dark:text-[#aaa]">
              {t("joiningDescription")}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="p-8 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border border-red-500/50 dark:border-red-500/30 rounded-2xl max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-semibold text-black dark:text-white">
              {t("errorTitle")}
            </h2>
            <p className="text-sm text-[#666] dark:text-[#aaa]">{error}</p>
            <Button
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="mt-4"
            >
              {tCommon("backToDashboard")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Call UI
  if (!call) {
    return null;
  }

  return (
    <StreamCall call={call}>
      <VideoCallUI
        otherParticipant={otherParticipant}
        isTutor={isTutor}
        callDuration={callDuration}
        formatDuration={formatDuration}
        onLeave={handleLeaveCall}
      />
    </StreamCall>
  );
}

/**
 * Video Call UI Component
 * Renders the actual call interface with participants and controls
 */
interface VideoCallUIProps {
  otherParticipant: OtherParticipant;
  isTutor: boolean;
  callDuration: number;
  formatDuration: (seconds: number) => string;
  onLeave: () => void;
}

function VideoCallUI({
  otherParticipant,
  isTutor,
  callDuration,
  formatDuration,
  onLeave,
}: VideoCallUIProps) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const t = useTranslations("videoCall");

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-[#e5e5e5] dark:border-[#262626] z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {otherParticipant.image ? (
              <Image
                src={otherParticipant.image}
                alt={otherParticipant.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] dark:bg-[#262626] flex items-center justify-center">
                <User className="w-5 h-5 text-[#666] dark:text-[#aaa]" />
              </div>
            )}
            <div>
              <h1 className="font-semibold text-black dark:text-white">
                {otherParticipant.name}
              </h1>
              <p className="text-xs text-[#666] dark:text-[#aaa]">
                {isTutor ? "Student" : "Tutor"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Call Duration */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#e5e5e5] dark:border-[#262626] rounded-full">
            <Clock className="w-4 h-4 text-[#666] dark:text-[#aaa]" />
            <span className="text-sm font-medium text-black dark:text-white">
              {formatDuration(callDuration)}
            </span>
          </div>

          {/* Call Status */}
          <Badge
            variant="outline"
            className={
              callingState === "joined"
                ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30"
                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
            }
          >
            {callingState === "joined" ? t("connected") : t("connecting")}
          </Badge>
        </div>
      </header>

      {/* Video Area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {callingState === "joined" ? (
          <SpeakerLayout participantsBarPosition="bottom" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-white">
                {callingState === "joining" 
                  ? t("joining") 
                  : callingState === "reconnecting"
                  ? "Reconnecting..."
                  : t("connecting")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-t border-[#e5e5e5] dark:border-[#262626]">
        <div className="flex items-center justify-center gap-3 max-w-4xl mx-auto">
          <ToggleAudioPublishingButton />
          <ToggleVideoPublishingButton />
          <ScreenShareButton />
          <CancelCallButton onLeave={onLeave} />
        </div>
      </div>
    </div>
  );
}
