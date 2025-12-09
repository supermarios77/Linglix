"use client";

/**
 * VideoSessionClient Component - Production Ready
 * 
 * Client component that handles video session initialization,
 * token fetching, and call management with proper error handling.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

// Dynamically import VideoCall to prevent SSR issues
const VideoCall = dynamic(() => import("./VideoCall").then((mod) => ({ default: mod.VideoCall })), {
  ssr: false,
  loading: () => (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-lg font-semibold">Loading video call...</p>
      </div>
    </Card>
  ),
});

interface VideoSessionClientProps {
  bookingId: string;
  userRole: "tutor" | "student";
  userName: string;
  otherUserName: string;
  locale: string;
}

export function VideoSessionClient({
  bookingId,
  userRole,
  userName,
  otherUserName,
  locale,
}: VideoSessionClientProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [flexibleToken, setFlexibleToken] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string | null>(null);
  const [uid, setUid] = useState<number | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Start video session on server
      const startResponse = await fetch("/api/video-sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start session");
      }

      // Fetch Agora token
      const tokenResponse = await fetch("/api/agora/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get token");
      }

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.token || !tokenData.channelName || !tokenData.uid || !tokenData.appId) {
        throw new Error("Invalid token response from server");
      }

      setToken(tokenData.token);
      setFlexibleToken(tokenData.flexibleToken || null);
      setChannelName(tokenData.channelName);
      setUid(tokenData.uid);
      setAppId(tokenData.appId);
      setIsLoading(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to initialize video session"
      );
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const handleEndCall = async () => {
    try {
      // End video session on server
      await fetch("/api/video-sessions/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      // Navigate back to dashboard
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      console.error("Error ending call:", error);
      // Still navigate even if API call fails
      router.push(`/${locale}/dashboard`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-lg font-semibold">Initializing video session...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please allow camera and microphone access when prompted
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Failed to Start Session</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={() => router.push(`/${locale}/dashboard`)}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!token || !channelName || uid === null || !appId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Missing Configuration</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Unable to initialize video call. Please try again.
            </p>
            <Button onClick={() => router.push(`/${locale}/dashboard`)}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)]">
        <VideoCall
          appId={appId}
          channelName={channelName}
          uid={uid}
          token={token}
          flexibleToken={flexibleToken || undefined}
          onEndCall={handleEndCall}
          userRole={userRole}
          userName={userName}
        />
      </div>
    </div>
  );
}

