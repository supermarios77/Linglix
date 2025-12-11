"use client";

/**
 * Stream Video Provider Component
 * 
 * Provides Stream Video client to the application.
 * Initializes StreamVideoClient with authenticated user and token provider.
 * 
 * Based on Stream Video SDK documentation:
 * https://getstream.io/video/docs/react/advanced/integration-best-practices/
 */

import { useEffect, useState, ReactNode, useRef } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from "@stream-io/video-react-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

interface StreamVideoProviderProps {
  children: ReactNode;
  userId: string;
  userName?: string | null;
  userImage?: string | null;
}

/**
 * Token provider function that fetches tokens from our API
 * 
 * Enhanced error handling following Stream SDK best practices:
 * - Validates response status
 * - Validates token presence in response
 * - Proper error logging
 * - Re-throws errors for SDK to handle
 */
const createTokenProvider = () => {
  return async (): Promise<string> => {
    try {
      const response = await fetch("/api/video/token", {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Token fetch failed with status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If parsing fails, use default message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || typeof data.token !== "string" || !data.token.trim()) {
        throw new Error("Token not found in response or invalid format");
      }

      return data.token;
    } catch (error) {
      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching Stream token:", error);
      }
      
      // Re-throw to inform SDK of the failure
      // SDK will handle retries and error states
      throw error;
    }
  };
};

export function StreamVideoProvider({
  children,
  userId,
  userName,
  userImage,
}: StreamVideoProviderProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false);
  const clientRef = useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    // Validate required props
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Stream Video: Missing or invalid userId");
      }
      return;
    }

    // Validate API key
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Stream Video: Missing or invalid API key. Video features will be disabled.");
      }
      // Don't set error - allow app to work without Stream
      return;
    }

    // Prevent multiple initializations
    if (isInitializing.current) {
      return;
    }

    isInitializing.current = true;
    setError(null);

    let clientInstance: StreamVideoClient | null = null;

    try {
      // Create user object for Stream
      const user: User = {
        id: userId.trim(),
        name: userName?.trim() || undefined,
        image: userImage?.trim() || undefined,
      };

      // Create token provider
      const tokenProvider = createTokenProvider();

      // Initialize Stream Video client
      // Using getOrCreateInstance to ensure single instance (best practice)
      clientInstance = StreamVideoClient.getOrCreateInstance({
        apiKey: apiKey.trim(),
        user,
        tokenProvider,
      });

      clientRef.current = clientInstance;
      setClient(clientInstance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize Stream Video";
      
      setError(errorMessage);
      
      if (process.env.NODE_ENV === "development") {
        console.error("Stream Video initialization error:", err);
      }
    } finally {
      isInitializing.current = false;
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      isInitializing.current = false;
      
      // Disconnect user when component unmounts or user changes
      // This follows Stream SDK best practices
      if (clientRef.current) {
        clientRef.current
          .disconnectUser()
          .catch((err) => {
            // Only log in development to avoid console noise
            if (process.env.NODE_ENV === "development") {
              console.error("Error disconnecting Stream user:", err);
            }
          });
        clientRef.current = null;
      }
    };
  }, [userId, userName, userImage]); // Only re-run if these change

  // If there's an error and we're in development, show it
  if (error && process.env.NODE_ENV === "development") {
    console.warn("Stream Video Provider Error:", error);
  }

  // If client is not ready, render children without StreamVideo wrapper
  // This allows the app to work even if Stream is not configured
  if (!client) {
    return <>{children}</>;
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}
