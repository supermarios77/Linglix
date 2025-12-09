"use client";

/**
 * VideoCall Component - Using agora-rtc-react (production-ready)
 * 
 * Based on: https://www.agora.io/en/blog/build-a-next-js-video-call-app/
 * Adapted for booking-based video calls with role-based access
 */

import { useState, useEffect, useMemo } from "react";
import { useRTCClient, AgoraRTCProvider } from "agora-rtc-react";
import {
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useRemoteUsers,
  useRemoteAudioTracks,
  usePublish,
  useJoin,
} from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface VideoCallProps {
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  onEndCall: () => void;
  userRole: "tutor" | "student";
  userName: string;
}

// Videos component - displays all participants
// This must be inside AgoraRTCProvider to use the hooks
function Videos({
  appId,
  channelName,
  uid,
  token,
  userName,
  userRole,
  onEndCall,
}: {
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  userName: string;
  userRole: "tutor" | "student";
  onEndCall: () => void;
}) {
  const { localMicrophoneTrack, isLoading: micLoading, error: micError } = useLocalMicrophoneTrack();
  const { localCameraTrack, isLoading: cameraLoading, error: cameraError } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers() || [];
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Check for permission errors
  useEffect(() => {
    if (micError || cameraError) {
      const error = micError || cameraError;
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        const isLocalhost = typeof window !== "undefined" && 
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        
        setPermissionError(
          isLocalhost
            ? "Camera/microphone access denied.\n\nPlease:\n1. Click the 'i' icon in the address bar\n2. Click 'Site settings'\n3. Allow Camera and Microphone\n4. Refresh the page"
            : "Camera/microphone access denied.\n\nPlease:\n1. Click the lock icon in the address bar\n2. Click 'Site settings'\n3. Allow Camera and Microphone\n4. Refresh the page"
        );
      } else if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
        setPermissionError("No camera/microphone found. Please connect a device and refresh.");
      }
    }
  }, [micError, cameraError]);

  // Join channel
  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: token,
      uid: uid,
    },
    true
  );

  // Publish local tracks (only if they exist and have no errors)
  const tracksToPublish = useMemo(() => {
    return [localMicrophoneTrack, localCameraTrack].filter(Boolean);
  }, [localMicrophoneTrack, localCameraTrack]);
  
  usePublish(tracksToPublish);

  // Play remote audio tracks safely
  useEffect(() => {
    if (audioTracks && Array.isArray(audioTracks)) {
      audioTracks.forEach((track) => {
        if (track) {
          try {
            track.play().catch((err) => {
              console.warn("Error playing remote audio track:", err);
            });
          } catch (error) {
            console.warn("Error playing remote audio track:", error);
          }
        }
      });
    }
  }, [audioTracks]);

  const isLoading = micLoading || cameraLoading;

  // Show permission error
  if (permissionError) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-center">
            <p className="font-semibold text-lg mb-2">Permission Required</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line mb-4">
              {permissionError}
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh Page
            </Button>
            <Button onClick={onEndCall} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold">Loading video call...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please allow camera and microphone access when prompted
          </p>
        </div>
      </Card>
    );
  }

  const toggleVideo = async () => {
    if (localCameraTrack) {
      try {
        await localCameraTrack.setEnabled(!isVideoEnabled);
        setIsVideoEnabled(!isVideoEnabled);
      } catch (error) {
        console.error("Error toggling video:", error);
      }
    }
  };

  const toggleAudio = async () => {
    if (localMicrophoneTrack) {
      try {
        await localMicrophoneTrack.setEnabled(!isAudioEnabled);
        setIsAudioEnabled(!isAudioEnabled);
      } catch (error) {
        console.error("Error toggling audio:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <div
            ref={(node) => {
              if (localCameraTrack && node) {
                try {
                  localCameraTrack.play(node).catch((err) => {
                    console.warn("Error playing local video track:", err);
                  });
                } catch (error) {
                  console.warn("Error playing local video track:", error);
                }
              }
            }}
            className="w-full h-full min-h-[300px]"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <VideoOff className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">{userName}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {userName} ({userRole === "tutor" ? "Tutor" : "Student"})
          </div>
        </div>

        {/* Remote Videos */}
        {Array.isArray(remoteUsers) && remoteUsers.length > 0 ? (
          remoteUsers.map((remoteUser) => {
            if (!remoteUser || !remoteUser.uid) return null;
            
            return (
              <div
                key={remoteUser.uid}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                <div
                  ref={(node) => {
                    if (remoteUser?.videoTrack && node) {
                      try {
                        remoteUser.videoTrack.play(node).catch((err) => {
                          console.warn("Error playing remote video track:", err);
                        });
                      } catch (error) {
                        console.warn("Error playing remote video track:", error);
                      }
                    }
                  }}
                  className="w-full h-full min-h-[300px]"
                />
                {!remoteUser.videoTrack && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">Remote User</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
            <div className="text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Waiting for other participant...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-white dark:bg-gray-900 border-t">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-14 h-14"
          disabled={!localMicrophoneTrack}
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-14 h-14"
          disabled={!localCameraTrack}
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Status */}
      <div className="px-4 pb-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Connected • {(Array.isArray(remoteUsers) ? remoteUsers.length : 0) + 1} participant
          {(Array.isArray(remoteUsers) ? remoteUsers.length : 0) + 1 !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// Main VideoCall component
export function VideoCall({
  appId,
  channelName,
  uid,
  token,
  onEndCall,
  userRole,
  userName,
}: VideoCallProps) {
  const [error, setError] = useState<string | null>(null);

  // Create RTC client using useMemo to ensure stable reference
  const client = useRTCClient(
    () =>
      import("agora-rtc-sdk-ng").then((AgoraRTC) => {
        const RTC = AgoraRTC.default || AgoraRTC;
        if (!RTC || !RTC.createClient) {
          throw new Error("Failed to load Agora SDK");
        }
        return RTC.createClient({ mode: "rtc", codec: "vp8" });
      })
  );

  // Handle errors - only set up listeners if client is valid
  useEffect(() => {
    if (!client) {
      setError("Failed to initialize video client");
      return;
    }

    // Check if client has the 'on' method before using it
    if (typeof client.on !== "function") {
      console.error("Client does not have 'on' method:", client);
      setError("Invalid client initialization");
      return;
    }

    const handleError = (err: any) => {
      console.error("Agora error:", err);
      // Don't show permission errors here - they're handled in Videos component
      if (err?.name !== "NotAllowedError" && err?.name !== "PermissionDeniedError") {
        setError(err?.message || "An error occurred");
      }
    };

    const handleConnectionChange = (curState: string) => {
      if (curState === "DISCONNECTED") {
        setError("Connection lost. Please check your internet connection.");
      } else if (curState === "CONNECTED") {
        setError(null); // Clear error on successful connection
      }
    };

    try {
      client.on("exception", handleError);
      client.on("connection-state-change", handleConnectionChange);
    } catch (err) {
      console.error("Error setting up client listeners:", err);
    }

    return () => {
      try {
        if (typeof client.off === "function") {
          client.off("exception", handleError);
          client.off("connection-state-change", handleConnectionChange);
        }
      } catch (err) {
        console.error("Error cleaning up client listeners:", err);
      }
    };
  }, [client]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <Button onClick={onEndCall} className="mt-4 w-full">
          Close
        </Button>
      </Card>
    );
  }

  // Don't render provider if client is invalid
  if (!client) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="font-semibold mb-2">Failed to Initialize</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Unable to initialize video client. Please refresh the page.
          </p>
          <Button onClick={onEndCall}>Close</Button>
        </div>
      </Card>
    );
  }

  return (
    <AgoraRTCProvider client={client}>
      <Videos
        appId={appId}
        channelName={channelName}
        uid={uid}
        token={token}
        userName={userName}
        userRole={userRole}
        onEndCall={onEndCall}
      />
    </AgoraRTCProvider>
  );
}
