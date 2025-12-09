"use client";

/**
 * VideoCall Component - 100ms Integration
 * 
 * Production-ready video call component using 100ms React SDK.
 * Based on: https://medium.com/@ashwinkv.akv/integrating-100ms-live-react-sdk-for-live-streaming-in-next-js-2214c5add663
 * 
 * Features:
 * - Server-side token generation
 * - Role-based access (teacher/student)
 * - Proper error handling
 * - Permission management
 * - Cleanup on unmount
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  HMSRoomProvider,
} from "@100mslive/react-sdk";
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
// Note: logger is server-side only, use console for client-side

interface VideoCallProps {
  token: string;
  roomId: string;
  userId: string;
  role: string;
  appId: string;
  onEndCall: () => void;
  userRole: "tutor" | "student";
  userName: string;
}

// Inner component that uses HMS hooks (must be inside HMSRoomProvider)
function VideoCallInner({
  token,
  roomId,
  userId,
  role,
  onEndCall,
  userRole,
  userName,
}: Omit<VideoCallProps, "appId">) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const isAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const mountedRef = useRef(true);

  // Join room on mount
  useEffect(() => {
    let isMounted = true;

    const joinRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setPermissionError(null);

        // Join the room with token
        await hmsActions.join({
          authToken: token,
          userName: userName || (userRole === "tutor" ? "Tutor" : "Student"),
        });

        if (isMounted) {
          setIsLoading(false);
          console.log("Successfully joined 100ms room", { roomId, userId, role });
        }
      } catch (err: any) {
        if (!isMounted) return;

        // Handle permission errors
        if (
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError" ||
          err?.message?.includes("PERMISSION_DENIED")
        ) {
          const isLocalhost =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1");

          setPermissionError(
            isLocalhost
              ? "Camera/microphone access denied.\n\nPlease:\n1. Click the 'i' icon in the address bar\n2. Click 'Site settings'\n3. Allow Camera and Microphone\n4. Refresh the page"
              : "Camera/microphone access denied.\n\nPlease:\n1. Click the lock icon in the address bar\n2. Click 'Site settings'\n3. Allow Camera and Microphone\n4. Refresh the page"
          );
        } else {
          setError(
            err?.message || "Failed to join video call. Please try again."
          );
          console.error("Failed to join 100ms room", {
            error: err?.message || String(err),
            roomId,
          });
        }

        setIsLoading(false);
      }
    };

    if (!isConnected) {
      joinRoom();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token, roomId, userId, role, userName, userRole, hmsActions, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (isConnected) {
        hmsActions.leave().catch((err) => {
          console.error("Error leaving 100ms room", {
            error: err?.message || String(err),
          });
        });
      }
    };
  }, [isConnected, hmsActions]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    try {
      await hmsActions.setEnabledTrack(!isAudioEnabled, "audio");
    } catch (err) {
      console.error("Error toggling audio", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [hmsActions, isAudioEnabled]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      await hmsActions.setEnabledTrack(!isVideoEnabled, "video");
    } catch (err) {
      console.error("Error toggling video", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [hmsActions, isVideoEnabled]);

  // Handle end call
  const handleEndCall = useCallback(async () => {
    try {
      if (isConnected) {
        await hmsActions.leave();
      }
    } catch (err) {
      console.error("Error leaving room", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    onEndCall();
  }, [hmsActions, isConnected, onEndCall]);

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
            <Button onClick={() => window.location.reload()} className="flex-1">
              Refresh Page
            </Button>
            <Button onClick={handleEndCall} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Show error
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

  // Show loading
  if (isLoading || !isConnected) {
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

  // Filter out local peer
  const remotePeers = peers.filter((peer) => !peer.isLocal);
  const localPeer = peers.find((peer) => peer.isLocal);

  return (
    <div className="flex flex-col h-full">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg">
        {/* Local Video */}
        {localPeer && (
          <PeerVideo
            peer={localPeer}
            isLocal={true}
            userName={userName}
            userRole={userRole}
            videoRefs={videoRefs}
            isVideoEnabled={isVideoEnabled}
          />
        )}

        {/* Remote Videos */}
        {remotePeers.length > 0 ? (
          remotePeers.map((peer) => (
            <PeerVideo
              key={peer.id}
              peer={peer}
              isLocal={false}
              userName={peer.name || "Remote User"}
              userRole={userRole}
              videoRefs={videoRefs}
              isVideoEnabled={!!peer.videoTrack}
            />
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
          disabled={!isConnected}
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
          disabled={!isConnected}
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
          Connected • {peers.length} participant{peers.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// Peer Video Component
function PeerVideo({
  peer,
  isLocal,
  userName,
  userRole,
  videoRefs,
  isVideoEnabled,
}: {
  peer: any;
  isLocal: boolean;
  userName: string;
  userRole: "tutor" | "student";
  videoRefs: React.MutableRefObject<Map<string, HTMLVideoElement>>;
  isVideoEnabled: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.videoTrack) {
      peer.videoTrack.attach(videoRef.current);
      return () => {
        peer.videoTrack?.detach();
      };
    }
  }, [peer.videoTrack]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full min-h-[300px] object-cover"
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
  );
}

// Main VideoCall component with HMSRoomProvider
export function VideoCall({
  token,
  roomId,
  userId,
  role,
  appId,
  onEndCall,
  userRole,
  userName,
}: VideoCallProps) {
  return (
    <HMSRoomProvider>
      <VideoCallInner
        token={token}
        roomId={roomId}
        userId={userId}
        role={role}
        onEndCall={onEndCall}
        userRole={userRole}
        userName={userName}
      />
    </HMSRoomProvider>
  );
}

