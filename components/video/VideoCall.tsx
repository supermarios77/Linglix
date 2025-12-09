"use client";

/**
 * VideoCall Component - Production Ready
 * 
 * Implements Agora video calling with Next.js best practices:
 * - Proper dynamic imports (SSR-safe)
 * - Comprehensive error handling
 * - Proper track lifecycle management
 * - Connection state management
 * - Memory leak prevention
 * - Network error recovery
 */

import { useEffect, useRef, useState, useCallback } from "react";
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

interface RemoteUser {
  uid: number;
  videoTrack?: any;
  audioTrack?: any;
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
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<{
    videoTrack?: any;
    audioTrack?: any;
  }>({});
  const remoteTracksRef = useRef<Map<number, { videoTrack?: any; audioTrack?: any }>>(new Map());

  // Cleanup function
  const cleanup = useCallback(async () => {
    try {
      // Stop and close local tracks
      if (localTracksRef.current.audioTrack) {
        localTracksRef.current.audioTrack.stop();
        localTracksRef.current.audioTrack.close();
        localTracksRef.current.audioTrack = undefined;
      }
      if (localTracksRef.current.videoTrack) {
        localTracksRef.current.videoTrack.stop();
        localTracksRef.current.videoTrack.close();
        localTracksRef.current.videoTrack = undefined;
      }

      // Stop and close remote tracks
      remoteTracksRef.current.forEach((tracks) => {
        if (tracks.videoTrack) {
          tracks.videoTrack.stop();
          tracks.videoTrack.close();
        }
        if (tracks.audioTrack) {
          tracks.audioTrack.stop();
          tracks.audioTrack.close();
        }
      });
      remoteTracksRef.current.clear();

      // Unpublish and leave channel
      if (clientRef.current) {
        try {
          const tracks = [
            localTracksRef.current.audioTrack,
            localTracksRef.current.videoTrack,
          ].filter(Boolean);
          
          if (tracks.length > 0) {
            await clientRef.current.unpublish(tracks);
          }
          await clientRef.current.leave();
        } catch (leaveError) {
          logger.error("Error leaving channel", {
            error: leaveError instanceof Error ? leaveError.message : String(leaveError),
          });
        }
        clientRef.current = null;
      }

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
      }
      remoteVideoRefs.current.forEach((el) => {
        if (el) {
          el.innerHTML = "";
        }
      });
      remoteVideoRefs.current.clear();
    } catch (error) {
      logger.error("Error during cleanup", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let AgoraRTC: any = null;

    const initializeAgora = async () => {
      try {
        setConnectionState("connecting");
        
        // Dynamically import Agora SDK (client-side only)
        // Agora SDK exports as default
        const agoraModule = await import("agora-rtc-sdk-ng");
        AgoraRTC = agoraModule.default || agoraModule;

        if (!AgoraRTC) {
          throw new Error("Failed to load Agora SDK");
        }

        // Create Agora client
        const client = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        clientRef.current = client;

        // Set up connection state handler
        client.on("connection-state-change", (curState: string, revState: string) => {
          logger.info("Connection state changed", { curState, revState });
          if (curState === "CONNECTED") {
            setConnectionState("connected");
          } else if (curState === "DISCONNECTED") {
            setConnectionState("disconnected");
          }
        });

        // Handle user published (when remote user joins with audio/video)
        client.on("user-published", async (user: any, mediaType: "audio" | "video") => {
          if (!mounted) return;

          try {
            await client.subscribe(user, mediaType);

            if (mediaType === "video") {
              const remoteVideoTrack = user.videoTrack;
              if (remoteVideoTrack) {
                const remoteUid = user.uid;
                
                // Store track
                const existingTracks = remoteTracksRef.current.get(remoteUid) || {};
                remoteTracksRef.current.set(remoteUid, {
                  ...existingTracks,
                  videoTrack: remoteVideoTrack,
                });

                // Update remote users state
                setRemoteUsers((prev) => {
                  const existing = prev.find((u) => u.uid === remoteUid);
                  if (existing) {
                    return prev.map((u) =>
                      u.uid === remoteUid ? { ...u, videoTrack: remoteVideoTrack } : u
                    );
                  }
                  return [...prev, { uid: remoteUid, videoTrack: remoteVideoTrack }];
                });

                // Wait for DOM to update, then play video
                setTimeout(() => {
                  const remoteVideoElement = remoteVideoRefs.current.get(remoteUid);
                  if (remoteVideoElement && mounted) {
                    remoteVideoTrack.play(remoteVideoElement);
                  }
                }, 100);
              }
            }

            if (mediaType === "audio") {
              const remoteAudioTrack = user.audioTrack;
              if (remoteAudioTrack) {
                const remoteUid = user.uid;
                
                // Store track
                const existingTracks = remoteTracksRef.current.get(remoteUid) || {};
                remoteTracksRef.current.set(remoteUid, {
                  ...existingTracks,
                  audioTrack: remoteAudioTrack,
                });

                // Update remote users state
                setRemoteUsers((prev) => {
                  const existing = prev.find((u) => u.uid === remoteUid);
                  if (existing) {
                    return prev.map((u) =>
                      u.uid === remoteUid ? { ...u, audioTrack: remoteAudioTrack } : u
                    );
                  }
                  return [...prev, { uid: remoteUid, audioTrack: remoteAudioTrack }];
                });

                // Play audio
                remoteAudioTrack.play().catch((err: Error) => {
                  logger.error("Error playing remote audio", {
                    error: err.message,
                    uid: remoteUid,
                  });
                });
              }
            }
          } catch (error) {
            logger.error("Error subscribing to remote user", {
              error: error instanceof Error ? error.message : String(error),
              userId: uid,
            });
          }
        });

        // Handle user unpublished (when remote user stops audio/video)
        client.on("user-unpublished", (user: any, mediaType: "audio" | "video") => {
          if (!mounted) return;

          const remoteUid = user.uid;

          if (mediaType === "video") {
            setRemoteUsers((prev) =>
              prev.map((u) =>
                u.uid === remoteUid ? { ...u, videoTrack: undefined } : u
              )
            );
          }

          if (mediaType === "audio") {
            setRemoteUsers((prev) =>
              prev.map((u) =>
                u.uid === remoteUid ? { ...u, audioTrack: undefined } : u
              )
            );
          }
        });

        // Handle user left
        client.on("user-left", (user: any) => {
          if (!mounted) return;
          
          const remoteUid = user.uid;
          
          // Clean up remote tracks
          const tracks = remoteTracksRef.current.get(remoteUid);
          if (tracks) {
            if (tracks.videoTrack) {
              tracks.videoTrack.stop();
              tracks.videoTrack.close();
            }
            if (tracks.audioTrack) {
              tracks.audioTrack.stop();
              tracks.audioTrack.close();
            }
            remoteTracksRef.current.delete(remoteUid);
          }

          // Remove from state
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUid));
          
          // Clear video element
          const videoElement = remoteVideoRefs.current.get(remoteUid);
          if (videoElement) {
            videoElement.innerHTML = "";
            remoteVideoRefs.current.delete(remoteUid);
          }
        });

        // Join channel
        await client.join(appId, channelName, token, uid);

        // Create local tracks with error handling
        let audioTrack: any;
        let videoTrack: any;

        try {
          [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            {
              encoderConfig: {
                bitrateMax: 1000,
                bitrateMin: 50,
              },
            },
            {
              encoderConfig: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                frameRate: { min: 15, ideal: 30, max: 30 },
                bitrateMax: 2000,
                bitrateMin: 200,
              },
            }
          );
        } catch (trackError: any) {
          // Handle permission errors gracefully
          if (trackError?.name === "NotAllowedError" || trackError?.name === "PermissionDeniedError") {
            throw new Error("Camera/microphone access denied. Please allow access and refresh.");
          }
          if (trackError?.name === "NotFoundError" || trackError?.name === "DevicesNotFoundError") {
            throw new Error("No camera/microphone found. Please connect a device.");
          }
          throw trackError;
        }

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
            // Video will still work, just might not display immediately
          }
        }

        setIsJoined(true);
        setIsLoading(false);
        setConnectionState("connected");

        logger.info("Successfully joined Agora channel", {
          channelName,
          uid,
          appId,
        });
      } catch (error) {
        if (!mounted) return;

        const errorMessage =
          error instanceof Error ? error.message : "Failed to initialize video call";
        setError(errorMessage);
        setIsLoading(false);
        setConnectionState("disconnected");

        logger.error("Failed to initialize Agora video call", {
          error: errorMessage,
          userId: uid,
          channelName,
          appId,
        });

        // Cleanup on error
        await cleanup();
      }
    };

    initializeAgora();

    // Cleanup on unmount
    return () => {
      mounted = false;
      cleanup();
    };
  }, [appId, channelName, token, uid, cleanup]);

  const toggleVideo = useCallback(async () => {
    try {
      if (localTracksRef.current.videoTrack) {
        await localTracksRef.current.videoTrack.setEnabled(!isVideoEnabled);
        setIsVideoEnabled(!isVideoEnabled);
      }
    } catch (error) {
      logger.error("Error toggling video", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [isVideoEnabled]);

  const toggleAudio = useCallback(async () => {
    try {
      if (localTracksRef.current.audioTrack) {
        await localTracksRef.current.audioTrack.setEnabled(!isAudioEnabled);
        setIsAudioEnabled(!isAudioEnabled);
      }
    } catch (error) {
      logger.error("Error toggling audio", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [isAudioEnabled]);

  const handleEndCall = useCallback(async () => {
    await cleanup();
    onEndCall();
  }, [cleanup, onEndCall]);

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
        <Button onClick={handleEndCall} className="mt-4 w-full">
          Close
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-semibold">Connecting to video call...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please allow camera and microphone access when prompted
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
          remoteUsers.map((remoteUser) => (
            <div
              key={remoteUser.uid}
              className="relative bg-gray-800 rounded-lg overflow-hidden"
            >
              <div
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current.set(remoteUser.uid, el);
                    // Re-play video if track exists and element is mounted
                    if (remoteUser.videoTrack) {
                      setTimeout(() => {
                        remoteUser.videoTrack?.play(el);
                      }, 50);
                    }
                  } else {
                    remoteVideoRefs.current.delete(remoteUser.uid);
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
          disabled={!isJoined}
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
          disabled={!isJoined}
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
          {connectionState === "connected" ? "Connected" : connectionState === "connecting" ? "Connecting..." : "Disconnected"} • {remoteUsers.length + 1} participant
          {remoteUsers.length + 1 !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
