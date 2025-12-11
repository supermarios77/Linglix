"use client";

/**
 * In-Call Chat Component
 * 
 * Displays chat messages and input during video calls.
 * Uses Stream Chat React components for UI.
 * 
 * Production-ready: Prevents multiple API calls by using useRef to track initialization
 * and letting the Channel component handle channel lifecycle.
 */

import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MessageSquare } from "lucide-react";

// Import Stream Chat CSS
import "stream-chat-react/dist/css/v2/index.css";

interface InCallChatProps {
  chatClient: StreamChat | null;
  channelId: string;
  isOpen: boolean;
  onToggle: () => void;
  memberIds: string[]; // Array of user IDs to add as channel members (student and tutor)
}

/**
 * Custom MessageInput wrapper to match our design
 */
function CustomMessageInput() {
  return (
    <div className="border-t border-[#e5e5e5] dark:border-[#262626] p-2">
      <MessageInput />
    </div>
  );
}

export function InCallChat({
  chatClient,
  channelId,
  isOpen,
  onToggle,
  memberIds,
}: InCallChatProps) {
  const t = useTranslations("chat");
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent re-initialization and track watch status
  const isInitializing = useRef(false);
  const channelRef = useRef<StreamChannel | null>(null);
  const initializedChannelId = useRef<string | null>(null);
  const hasWatched = useRef(false);
  
  // Memoize memberIds to prevent unnecessary re-renders
  // Sort to ensure consistent comparison
  const sortedMemberIds = useMemo(() => {
    return [...memberIds].sort().join(",");
  }, [memberIds]);

  // Only initialize channel when chat is opened
  useEffect(() => {
    // Don't initialize if chat is closed
    if (!isOpen) {
      return;
    }

    // Skip if already initialized for this channel
    if (initializedChannelId.current === channelId && channelRef.current) {
      setIsLoading(false);
      setChannel(channelRef.current);
      return;
    }

    if (!chatClient || !channelId || !memberIds.length) {
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous initializations
    if (isInitializing.current) {
      return;
    }

    isInitializing.current = true;
    let mounted = true;

    const initializeChannel = async () => {
      try {
        // Get or create channel for this booking
        // Channel type: "messaging", Channel ID: same as callId
        const channelInstance = chatClient.channel("messaging", channelId, {
          members: memberIds,
        });

        // Only watch once per channel - prevent multiple API calls
        // Reset watch flag if channelId changed
        if (initializedChannelId.current !== channelId) {
          hasWatched.current = false;
        }

        if (!hasWatched.current) {
          await channelInstance.watch();
          hasWatched.current = true;
        }

        // Store channel instance
        if (mounted) {
          channelRef.current = channelInstance;
          initializedChannelId.current = channelId;
          setChannel(channelInstance);
          setIsLoading(false);
          setError(null);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error initializing chat channel:", error);
        }
        if (mounted) {
          setError(error instanceof Error ? error.message : "Failed to load chat");
          setIsLoading(false);
        }
      } finally {
        isInitializing.current = false;
      }
    };

    initializeChannel();

    return () => {
      mounted = false;
    };
  }, [chatClient, channelId, sortedMemberIds, isOpen]); // Include isOpen to trigger when chat opens

  if (!chatClient) {
    return null;
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-[#ccf381] hover:bg-[#d4f89a] text-black shadow-xl hover:shadow-2xl transition-all"
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border border-[#e5e5e5] dark:border-[#262626] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#e5e5e5] dark:border-[#262626]">
        <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t("title")}
        </h3>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-[#f5f5f5] dark:hover:bg-[#262626]"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-[#666] dark:text-[#aaa] text-sm">
            {t("loading")}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">
            {error}
          </div>
        ) : channel ? (
          <Chat client={chatClient}>
            <Channel channel={channel} initializeOnMount={false}>
              <Window>
                <div className="flex-1 overflow-hidden flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <MessageList />
                  </div>
                  <CustomMessageInput />
                </div>
              </Window>
            </Channel>
          </Chat>
        ) : (
          <div className="flex items-center justify-center h-full text-[#666] dark:text-[#aaa] text-sm">
            {t("error")}
          </div>
        )}
      </div>
    </Card>
  );
}
