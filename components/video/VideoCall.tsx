"use client";

/**
 * VideoCall Component
 * 
 * Production-ready Agora video call component with:
 * - Role-based access (tutor/student)
 * - Proper error handling and cleanup
 * - Audio/video controls
 * - Connection state management
 * - Responsive design
 */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Users,
  AlertCircle,
} from "lucide-react";
import { logger } from "@/lib/logger";

interface VideoCallProps {
  appId: string;
  channelName: string;
  uid: number;
  token: string;
  onEndCall: () => void;
  userRole: "tutor" | "student";
  userName: string;
}

export function VideoCall({
  appId,
  channelName,
  uid,
  token,
  onEndCall,
  userRole,
  userName,
}: VideoCallProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<{
    videoTrack?: any;
    audioTrack?: any;
  }>({});

  useEffect(() => {
    let mounted = true;

    const initializeAgora = async () => {
      try {
        // Dynamically import Agora SDK (client-side only)
        const AgoraRTC = await import("agora-rtc-sdk-ng");
        
        // Handle both default and named exports
        const RTC = AgoraRTC.default || AgoraRTC;

        // Create Agora client
        const client = RTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        clientRef.current = client;

        // Set up event handlers
        client.on("user-published", async (user, mediaType) => {
          if (!mounted) return;

          try {
            await client.subscribe(user, mediaType);

            if (mediaType === "video") {
              const remoteVideoTrack = user.videoTrack;
              if (remoteVideoTrack) {
                const remoteUid = user.uid;
                setRemoteUsers((prev) => {
                  if (!prev.includes(remoteUid)) {
                    return [...prev, remoteUid];
                  }
                  return prev;
                });

                // Wait for DOM to update
                setTimeout(() => {
                  const remoteVideoElement = remoteVideoRefs.current.get(remoteUid);
                  if (remoteVideoElement) {
                    remoteVideoTrack.play(remoteVideoElement);
                  }
                }, 100);
              }
            }

            if (mediaType === "audio") {
              const remoteAudioTrack = user.audioTrack;
              if (remoteAudioTrack) {
                remoteAudioTrack.play();
              }
            }
          } catch (error) {
            logger.error("Error subscribing to remote user", {
              error: error instanceof Error ? error.message : String(error),
              userId: uid,
            });
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (!mounted) return;

          if (mediaType === "video") {
            setRemoteUsers((prev) => prev.filter((id) => id !== user.uid));
          }
        });

        client.on("user-left", (user) => {
          if (!mounted) return;
          setRemoteUsers((prev) => prev.filter((id) => id !== user.uid));
        });

        // Join channel
        await client.join(appId, channelName, token, uid);

        // Create local tracks
        const [audioTrack, videoTrack] = await RTC.createMicrophoneAndCameraTracks(
          {},
          {
            encoderConfig: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
            },
          }
        );

        localTracksRef.current = { audioTrack, videoTrack };

        // Publish local tracks
        await client.publish([audioTrack, videoTrack]);

        // Play local video
        if (localVideoRef.current && videoTrack) {
          try {
            videoTrack.play(localVideoRef.current);
          } catch (playError) {
            logger.error("Error playing local video", {
              error: playError instanceof Error ? playError.message : String(playError),
            });
            // Try alternative: create video element
            const videoElement = document.createElement("div");
            videoElement.id = `local-video-${uid}`;
            if (localVideoRef.current) {
              localVideoRef.current.appendChild(videoElement);
              videoTrack.play(videoElement);
            }
          }
        }

        setIsJoined(true);
        setIsLoading(false);
      } catch (error) {
        if (!mounted) return;

        const errorMessage =
          error instanceof Error ? error.message : "Failed to initialize video call";
        setError(errorMessage);
        setIsLoading(false);

        logger.error("Failed to initialize Agora video call", {
          error: errorMessage,
          userId: uid,
          channelName,
        });
      }
    };

    initializeAgora();

    // Cleanup function
    return () => {
      mounted = false;

      const cleanup = async () => {
        try {
          // Unpublish and stop local tracks
          if (localTracksRef.current.audioTrack) {
            localTracksRef.current.audioTrack.stop();
            localTracksRef.current.audioTrack.close();
          }
          if (localTracksRef.current.videoTrack) {
            localTracksRef.current.videoTrack.stop();
            localTracksRef.current.videoTrack.close();
          }

          // Leave channel
          if (clientRef.current) {
            await clientRef.current.leave();
          }
        } catch (error) {
          logger.error("Error during video call cleanup", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      };

      cleanup();
    };
  }, [appId, channelName, token, uid]);

  const toggleVideo = async () => {
    try {
      if (localTracksRef.current.videoTrack) {
        if (isVideoEnabled) {
          await localTracksRef.current.videoTrack.setEnabled(false);
        } else {
          await localTracksRef.current.videoTrack.setEnabled(true);
        }
        setIsVideoEnabled(!isVideoEnabled);
      }
    } catch (error) {
      logger.error("Error toggling video", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const toggleAudio = async () => {
    try {
      if (localTracksRef.current.audioTrack) {
        if (isAudioEnabled) {
          await localTracksRef.current.audioTrack.setEnabled(false);
        } else {
          await localTracksRef.current.audioTrack.setEnabled(true);
        }
        setIsAudioEnabled(!isAudioEnabled);
      }
    } catch (error) {
      logger.error("Error toggling audio", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleEndCall = async () => {
    try {
      // Unpublish and stop local tracks
      if (localTracksRef.current.audioTrack) {
        localTracksRef.current.audioTrack.stop();
        localTracksRef.current.audioTrack.close();
      }
      if (localTracksRef.current.videoTrack) {
        localTracksRef.current.videoTrack.stop();
        localTracksRef.current.videoTrack.close();
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      onEndCall();
    } catch (error) {
      logger.error("Error ending call", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Still call onEndCall to ensure UI updates
      onEndCall();
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <Button onClick={onEndCall} className="mt-4">
          Close
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-lg font-semibold">Connecting to video call...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please allow camera and microphone access
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <div
            ref={localVideoRef}
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
        {remoteUsers.length > 0 ? (
          remoteUsers.map((remoteUid) => (
            <div
              key={remoteUid}
              className="relative bg-gray-800 rounded-lg overflow-hidden"
            >
              <div
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current.set(remoteUid, el);
                  } else {
                    remoteVideoRefs.current.delete(remoteUid);
                  }
                }}
                className="w-full h-full min-h-[300px]"
              />
            </div>
          ))
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
          onClick={handleEndCall}
          className="rounded-full w-14 h-14"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Status */}
      <div className="px-4 pb-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isJoined ? "Connected" : "Connecting..."} • {remoteUsers.length + 1} participant
          {remoteUsers.length + 1 !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

