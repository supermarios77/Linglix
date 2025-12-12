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
  useStreamVideoClient,
  useCall,
  ParticipantView,
  hasVideo,
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
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
} from "lucide-react";
import Image from "next/image";
import { InCallChat } from "@/components/chat/InCallChat";
import { useStreamChatClient } from "@/components/chat/StreamChatProvider";

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
  bookingId: string;
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
  bookingId,
}: VideoCallClientProps) {
  const router = useRouter();
  const t = useTranslations("videoCall");
  const tCommon = useTranslations("common");

  const [call, setCall] = useState<Call | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const callStartTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get Stream clients from context
  const streamClient = useStreamVideoClient();
  const chatClient = useStreamChatClient();

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
          await callInstance.leave().catch((err) => {
            if (process.env.NODE_ENV === "development") {
              console.error("Error leaving call on unmount:", err);
            }
          });
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
      // If tutor is ending the call, mark it as ended in the database
      if (isTutor && bookingId) {
        try {
          await fetch(`/api/bookings/${bookingId}/end-call`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (err) {
          // Log error but continue with leaving the call
          if (process.env.NODE_ENV === "development") {
            console.error("Error ending call in database:", err);
          }
        }
      }

      // Leave the Stream call
      if (call) {
        await call.leave();
      }
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error leaving call:", err);
      }
      // Still redirect even if leave fails
      router.push(`/${locale}/dashboard`);
    }
  }, [call, router, locale, isTutor, bookingId]);

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
        call={call}
      />
      {/* In-Call Chat */}
      <InCallChat
        chatClient={chatClient}
        channelId={callId}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        memberIds={[user.id, otherParticipant.id]}
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
  call: Call;
}

function VideoCallUI({
  otherParticipant,
  isTutor,
  callDuration,
  formatDuration,
  onLeave,
  call: _call,
}: VideoCallUIProps) {
  const { 
    useCallCallingState, 
    useLocalParticipant,
    useMicrophoneState,
    useCameraState,
    useScreenShareState,
    useParticipants,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const microphoneState = useMicrophoneState();
  const cameraState = useCameraState();
  const screenShareState = useScreenShareState();
  const participants = useParticipants();
  const call = useCall();
  const t = useTranslations("videoCall");
  
  // Check if device is mobile (screen sharing not supported on mobile browsers)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Get the actual remote participant from Stream SDK
  const remoteParticipant = participants.find((p) => !p.isLocalParticipant);
  
  // For header display, prefer booking data (more reliable) but use Stream data as fallback
  // Booking data is always correct because it comes from the database relationship
  const displayParticipant = {
    id: otherParticipant.id,
    name: otherParticipant.name,
    image: otherParticipant.image,
  };

  // Get publishing states
  // isMute is true when muted/disabled, so we invert it to get enabled state
  const isAudioEnabled = microphoneState ? !microphoneState.isMute : false;
  const isVideoEnabled = cameraState ? !cameraState.isMute : false;
  // Check screen share status from the hook
  const isScreenSharing = screenShareState?.status === "enabled" || false;
  
  // Get control objects
  const microphone = microphoneState?.microphone;
  const camera = cameraState?.camera;
  const screenShare = screenShareState?.screenShare;

  // Toggle handlers
  const toggleAudio = async () => {
    if (!microphone) return;
    try {
      await microphone.toggle();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error toggling audio:", error);
      }
    }
  };

  const toggleVideo = async () => {
    if (!camera) return;
    try {
      await camera.toggle();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error toggling video:", error);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenShare) return;
    try {
      await screenShare.toggle();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error toggling screen share:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] dark:bg-[#000000]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6 bg-white/98 dark:bg-[#1a1a1a]/98 backdrop-blur-xl border-b border-[#e5e5e5] dark:border-[#262626] z-10 shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            {displayParticipant.image ? (
              <div className="relative">
                <Image
                  src={displayParticipant.image}
                  alt={displayParticipant.name}
                  width={52}
                  height={52}
                  className="rounded-full border-2 border-[#e5e5e5] dark:border-[#262626] shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a] animate-pulse"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-2 border-[#e5e5e5] dark:border-[#262626] shadow-md">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a] animate-pulse"></div>
              </div>
            )}
            <div>
              <h1 className="font-semibold text-base sm:text-lg text-black dark:text-white">
                {displayParticipant.name}
              </h1>
              <p className="text-xs text-[#666] dark:text-[#aaa] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {isTutor ? "Student" : "Tutor"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Call Duration */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-white/90 to-white/70 dark:from-[#0a0a0a]/90 dark:to-[#0a0a0a]/70 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-full shadow-md">
            <Clock className="w-4 h-4 text-[#666] dark:text-[#aaa]" />
            <span className="text-sm font-bold text-black dark:text-white tabular-nums">
              {formatDuration(callDuration)}
            </span>
          </div>

          {/* Call Status */}
          <Badge
            variant="outline"
            className={
              callingState === "joined"
                ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30 shadow-md px-3 py-1.5"
                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 shadow-md px-3 py-1.5"
            }
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${callingState === "joined" ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-pulse"}`} />
            {callingState === "joined" ? t("connected") : t("connecting")}
          </Badge>
        </div>
      </header>

      {/* Video Area */}
      <div className="flex-1 relative bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
        {callingState === "joined" ? (
          <CustomVideoLayout otherParticipant={otherParticipant} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative mb-6">
                <Loader2 className="w-12 h-12 animate-spin text-[#ccf381] mx-auto" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-[#ccf381]/20 rounded-full mx-auto" />
              </div>
              <p className="text-white text-lg font-medium">
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
      <div className="p-4 sm:p-6 bg-white/98 dark:bg-[#1a1a1a]/98 backdrop-blur-xl border-t border-[#e5e5e5] dark:border-[#262626] shadow-2xl">
        <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* Microphone Toggle */}
          <Button
            onClick={toggleAudio}
            size="lg"
            variant={isAudioEnabled ? "default" : "destructive"}
            disabled={!microphone}
            className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 ${
              isAudioEnabled
                ? "bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-2 border-[#e5e5e5] dark:border-[#262626] hover:bg-[#f5f5f5] dark:hover:bg-[#262626] hover:shadow-2xl"
                : "bg-red-500 hover:bg-red-600 text-white border-2 border-red-600 hover:shadow-red-500/50"
            }`}
            aria-label={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </Button>

          {/* Camera Toggle */}
          <Button
            onClick={toggleVideo}
            size="lg"
            variant={isVideoEnabled ? "default" : "destructive"}
            disabled={!camera}
            className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 ${
              isVideoEnabled
                ? "bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-2 border-[#e5e5e5] dark:border-[#262626] hover:bg-[#f5f5f5] dark:hover:bg-[#262626] hover:shadow-2xl"
                : "bg-red-500 hover:bg-red-600 text-white border-2 border-red-600 hover:shadow-red-500/50"
            }`}
            aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <VideoOff className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </Button>

          {/* Screen Share Toggle - Only for tutors, hidden on mobile (not supported) */}
          {isTutor && !isMobile && (
            <Button
              onClick={toggleScreenShare}
              size="lg"
              variant={isScreenSharing ? "default" : "outline"}
              disabled={!screenShare}
              className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 ${
                isScreenSharing
                  ? "bg-[#ccf381] hover:bg-[#d4f89a] text-black border-2 border-[#ccf381] hover:shadow-[0_0_20px_rgba(204,243,129,0.5)]"
                  : "bg-white dark:bg-[#1a1a1a] text-black dark:text-white border-2 border-[#e5e5e5] dark:border-[#262626] hover:bg-[#f5f5f5] dark:hover:bg-[#262626] hover:shadow-2xl"
              }`}
              aria-label={isScreenSharing ? "Stop sharing screen" : "Share screen"}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Monitor className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </Button>
          )}

          {/* Leave Call - Only for tutors */}
          {isTutor && (
            <Button
              onClick={onLeave}
              size="lg"
              variant="destructive"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-red-500 hover:bg-red-600 text-white border-2 border-red-600 transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 hover:shadow-red-500/50"
              aria-label="End call"
            >
              <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Custom Video Layout Component
 * Beautiful, modern video layout with custom participant views
 */
interface CustomVideoLayoutProps {
  otherParticipant: OtherParticipant;
}

function CustomVideoLayout({ otherParticipant }: CustomVideoLayoutProps) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  
  // Separate local and remote participants
  const localParticipant = participants.find((p) => p.isLocalParticipant);
  const remoteParticipants = participants.filter((p) => !p.isLocalParticipant);
  
  // Check for active screen share (prioritize remote participant's screen share)
  // ParticipantView automatically shows screen share when screenShareStream exists
  const screenSharingParticipant = participants.find(
    (p) => !!p.screenShareStream
  );

  // If no remote participants, show only local participant in full screen
  if (remoteParticipants.length === 0 && localParticipant) {
    const localHasVideo = hasVideo(localParticipant);
    
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-7xl rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-2xl border-2 border-[#262626]/50">
          {localHasVideo ? (
            <ParticipantView 
              participant={localParticipant} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-4 border-[#ccf381]/30 shadow-2xl">
                <User className="w-20 h-20 text-black" />
              </div>
            </div>
          )}
          {/* Participant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">You</p>
                  <p className="text-white/70 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Waiting for others to join...
                  </p>
                </div>
              </div>
              {!localHasVideo && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  <VideoOff className="w-4 h-4 mr-1" />
                  Camera off
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If someone is sharing screen, show it prominently
  if (screenSharingParticipant) {
    const isLocalSharing = screenSharingParticipant.isLocalParticipant;
    const sharingParticipantName = isLocalSharing ? "You" : otherParticipant.name;
    
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-7xl rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-2xl border-2 border-[#262626]/50">
          {/* Screen Share View */}
          <ParticipantView
            participant={screenSharingParticipant}
            className="h-full w-full object-contain"
          />
          {/* Participant Info Overlay */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[#ccf381]" />
              <p className="text-white font-semibold text-sm">
                {sharingParticipantName} is sharing screen
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For 1-on-1 calls, show side-by-side layout
  const isOneOnOne = remoteParticipants.length === 1;

  if (isOneOnOne) {
    const remoteParticipant = remoteParticipants[0];
    // Check if participant has video stream using Stream SDK utility
    const remoteHasVideo = remoteParticipant ? hasVideo(remoteParticipant) : false;
    const localHasVideo = localParticipant ? hasVideo(localParticipant) : false;
    
    // Prefer booking data (always correct) over Stream participant data (may be cached)
    const remoteDisplayName = otherParticipant.name;
    const remoteDisplayImage = otherParticipant.image;
    
    // 1-on-1 layout: Split screen with both participants
    return (
      <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Remote Participant (Main View) */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-2xl border-2 border-[#262626]/50 group hover:border-[#ccf381]/40 hover:shadow-[0_0_30px_rgba(204,243,129,0.2)] transition-all duration-300">
          {remoteHasVideo ? (
            <ParticipantView 
              participant={remoteParticipant} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
              {remoteDisplayImage ? (
                <Image
                  src={remoteDisplayImage}
                  alt={remoteDisplayName}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-[#ccf381]/30"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-4 border-[#ccf381]/30 shadow-2xl">
                  <User className="w-16 h-16 text-black" />
                </div>
              )}
            </div>
          )}
          {/* Participant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {remoteDisplayImage ? (
                  <Image
                    src={remoteDisplayImage}
                    alt={remoteDisplayName}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-2 border-white/30 shadow-lg">
                    <User className="w-5 h-5 text-black" />
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-base">{remoteDisplayName}</p>
                  <p className="text-white/70 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Connected
                  </p>
                </div>
              </div>
              {!remoteHasVideo && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  <VideoOff className="w-3 h-3 mr-1" />
                  Camera off
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Local Participant (Self View) */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-2xl border-2 border-[#262626]/50 group hover:border-[#ccf381]/40 hover:shadow-[0_0_30px_rgba(204,243,129,0.2)] transition-all duration-300">
          {localParticipant && localHasVideo ? (
            <ParticipantView 
              participant={localParticipant} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-4 border-[#ccf381]/30 shadow-2xl">
                <User className="w-16 h-16 text-black" />
              </div>
            </div>
          )}
          {/* Participant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <User className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-white font-semibold text-base">You</p>
                  <p className="text-white/70 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Local
                  </p>
                </div>
              </div>
              {!localHasVideo && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  <VideoOff className="w-3 h-3 mr-1" />
                  Camera off
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-participant layout: Grid view
  return (
      <div className="h-full w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
        {remoteParticipants.map((participant) => {
          const participantHasVideo = hasVideo(participant);
          return (
            <div
              key={participant.sessionId}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-2xl border-2 border-[#262626]/50 group hover:border-[#ccf381]/40 hover:shadow-[0_0_30px_rgba(204,243,129,0.2)] transition-all duration-300"
            >
              {participantHasVideo ? (
                <ParticipantView 
                  participant={participant} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-4 border-[#ccf381]/30 shadow-xl">
                    <User className="w-12 h-12 text-black" />
                  </div>
                </div>
              )}
              {/* Participant Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold text-sm truncate">
                    {otherParticipant.name}
                  </p>
                  {!participantHasVideo && (
                    <VideoOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {localParticipant && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] shadow-2xl border-2 border-[#262626]/50 group hover:border-[#ccf381]/40 hover:shadow-[0_0_30px_rgba(204,243,129,0.2)] transition-all duration-300">
            {hasVideo(localParticipant) ? (
              <ParticipantView 
                participant={localParticipant} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ccf381] to-[#a8d46f] flex items-center justify-center border-4 border-[#ccf381]/30 shadow-xl">
                  <User className="w-12 h-12 text-black" />
                </div>
              </div>
            )}
            {/* Participant Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">You</p>
                {!hasVideo(localParticipant) && (
                  <VideoOff className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
