import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  fetchConversationMessages,
  mergeConversationMessages,
} from "../api/fetchConversationMessages";
import { subscribeMessagePush } from "../lib/messagePushBus";
import type { ChatMessage } from "../types";

const POLL_INTERVAL_MS = 8_000;

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const refetch = useCallback(
    async (options: { silent?: boolean; full?: boolean } = {}) => {
      if (!conversationId || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      if (!options.silent) {
        setError(null);
      }

      try {
        const after =
          !options.full && messagesRef.current.length > 0
            ? messagesRef.current[messagesRef.current.length - 1]?.id
            : null;

        const incoming = await fetchConversationMessages(conversationId, {
          after: options.full ? null : after,
        });

        setMessages((current) =>
          options.full || current.length === 0
            ? incoming
            : mergeConversationMessages(current, incoming)
        );
        setError(null);
      } catch (err) {
        if (!options.silent) {
          setError(
            err instanceof Error ? err.message : "Mesajlar yüklenemedi"
          );
        }
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    messagesRef.current = [];
    void refetch({ full: true });

    pollTimerRef.current = setInterval(() => {
      void refetch({ silent: true });
    }, POLL_INTERVAL_MS);

    const unsubscribePush = subscribeMessagePush((pushedConversationId) => {
      if (pushedConversationId !== conversationId) {
        return;
      }
      void refetch({ silent: true });
    });

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        void refetch({ silent: true });
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      unsubscribePush();
      subscription.remove();
    };
  }, [conversationId, refetch]);

  return { messages, loading, error, refetch };
}
