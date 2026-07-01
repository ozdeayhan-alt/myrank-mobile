import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "@/features/auth";
import { fetchInboxEntries } from "../api/fetchInbox";
import type { InboxEntry } from "../types";

/** Inbox listesi — sürekli listener yerine periyodik poll. */
export const INBOX_POLL_MS = 45_000;

type InboxLoadMode = "initial" | "refresh" | "silent";

export function useInbox() {
  const { user } = useAuth();
  const userId = user?.uid;
  const [entries, setEntries] = useState<InboxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);
  const skipNextFocusRef = useRef(true);

  const loadInbox = useCallback(
    async (mode: InboxLoadMode = "silent") => {
      if (!userId) {
        return;
      }

      const fetchId = ++fetchIdRef.current;
      if (mode === "initial") {
        setLoading(true);
      }
      if (mode === "refresh") {
        setRefreshing(true);
      }
      if (mode !== "silent") {
        setError(null);
      }

      try {
        const next = await fetchInboxEntries(userId);
        if (fetchId !== fetchIdRef.current) {
          return;
        }
        setEntries(next);
        setError(null);
      } catch (err) {
        if (fetchId !== fetchIdRef.current) {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Mesajlar yüklenemedi";
        if (mode !== "silent") {
          setError(message);
        }
      } finally {
        const isStale = fetchId !== fetchIdRef.current;
        if (isStale && mode !== "initial" && mode !== "refresh") {
          return;
        }
        if (mode === "initial") {
          setLoading(false);
        }
        if (mode === "refresh") {
          setRefreshing(false);
        }
      }
    },
    [userId]
  );

  useEffect(() => {
    skipNextFocusRef.current = true;
    if (!userId) {
      setEntries([]);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    void loadInbox("initial");
  }, [userId, loadInbox]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const timer = setInterval(() => {
      void loadInbox("silent");
    }, INBOX_POLL_MS);

    return () => clearInterval(timer);
  }, [userId, loadInbox]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        if (state === "active") {
          void loadInbox("silent");
        }
      }
    );

    return () => subscription.remove();
  }, [userId, loadInbox]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return;
      }
      if (skipNextFocusRef.current) {
        skipNextFocusRef.current = false;
        return;
      }
      void loadInbox("silent");
    }, [userId, loadInbox])
  );

  const refresh = useCallback(() => loadInbox("refresh"), [loadInbox]);

  return { entries, loading, error, refreshing, refresh };
}
