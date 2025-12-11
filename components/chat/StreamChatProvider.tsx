"use client";

/**
 * Stream Chat Provider Component
 * 
 * Provides Stream Chat client to the application.
 * Initializes StreamChat with authenticated user and token provider.
 * Uses the same API key and token as Stream Video for consistency.
 * 
 * Based on Stream Chat SDK documentation:
 * https://getstream.io/chat/docs/react/
 */

import { useEffect, useState, ReactNode, useRef, createContext, useContext } from "react";
import { StreamChat, TokenOrProvider, User as ChatUser } from "stream-chat";

/**
 * Context for Stream Chat client
 */
const StreamChatContext = createContext<StreamChat | null>(null);

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

interface StreamChatProviderProps {
  children: ReactNode;
  userId: string;
  userName?: string | null;
  userImage?: string | null;
}

/**
 * Token provider function that fetches tokens from our API
 * Reuses the same video token endpoint (Stream tokens work for both Video and Chat)
 */
const createChatTokenProvider = (): TokenOrProvider => {
  return async (): Promise<string> => {
    try {
      const response = await fetch("/api/video/token", {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        let errorMessage = `Token fetch failed with status: ${response.status}`;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch {
          // If parsing fails, use default message
        }

        const error = new Error(errorMessage);
        error.name = "TokenProviderError";
        throw error;
      }

      const data = await response.json();

      if (!data || typeof data.token !== "string" || !data.token.trim()) {
        throw new Error("Token not found in response or invalid format");
      }

      return data.token;
    } catch (error) {
      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching Stream Chat token:", error);
      }
      
      // Re-throw to inform SDK of the failure
      throw error;
    }
  };
};

export function StreamChatProvider({
  children,
  userId,
  userName,
  userImage,
}: StreamChatProviderProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isInitializing = useRef(false);
  const clientRef = useRef<StreamChat | null>(null);

  useEffect(() => {
    // Validate required props
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Stream Chat: Missing or invalid userId");
      }
      return;
    }

    // Validate API key
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Stream Chat: Missing or invalid API key. Chat features will be disabled.");
      }
      return;
    }

    // Prevent multiple initializations
    if (isInitializing.current) {
      return;
    }

    isInitializing.current = true;
    setError(null);

    let chatClientInstance: StreamChat | null = null;

    const initializeChat = async () => {
      try {
        // Create user object for Stream Chat
        const user: ChatUser = {
          id: userId.trim(),
          name: userName?.trim() || undefined,
          image: userImage?.trim() || undefined,
        };

        // Get token provider
        const tokenProvider = createChatTokenProvider();

        // Initialize Stream Chat client
        // Using getInstance to ensure single instance (best practice)
        chatClientInstance = StreamChat.getInstance(apiKey.trim());

        // Connect user with token provider
        await chatClientInstance.connectUser(user, tokenProvider);

        clientRef.current = chatClientInstance;
        setChatClient(chatClientInstance);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize Stream Chat";
        
        setError(errorMessage);
        
        if (process.env.NODE_ENV === "development") {
          console.error("Stream Chat initialization error:", err);
        }
      } finally {
        isInitializing.current = false;
      }
    };

    initializeChat();

    // Cleanup on unmount or when dependencies change
    return () => {
      isInitializing.current = false;
      
      // Disconnect user when component unmounts or user changes
      if (clientRef.current) {
        clientRef.current
          .disconnectUser()
          .catch((err) => {
            // Only log in development to avoid console noise
            if (process.env.NODE_ENV === "development") {
              console.error("Error disconnecting Stream Chat user:", err);
            }
          });
        clientRef.current = null;
      }
    };
  }, [userId, userName, userImage]); // Only re-run if these change

  // If there's an error and we're in development, show it
  if (error && process.env.NODE_ENV === "development") {
    console.warn("Stream Chat Provider Error:", error);
  }

  // If client is not ready, render children without Chat wrapper
  // This allows the app to work even if Chat is not configured
  if (!chatClient) {
    return <>{children}</>;
  }

  // Export chatClient for use in child components
  return (
    <StreamChatContext.Provider value={chatClient}>
      {children}
    </StreamChatContext.Provider>
  );
}

/**
 * Hook to get the Stream Chat client
 * Use this in components that need direct access to the chat client
 */
export function useStreamChatClient(): StreamChat | null {
  return useContext(StreamChatContext);
}
