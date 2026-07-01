import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/features/auth";
import { useStoriesRingStore } from "../store/useStoriesRingStore";

const FOCUS_RELOAD_MIN_INTERVAL_MS = 60_000;

/** Story ring yüklemesi yalnızca ana sayfa odağında. */
export function StoriesRingBootstrap() {
  const { user } = useAuth();
  const load = useStoriesRingStore((state) => state.load);
  const lastFocusLoadAtRef = useRef(0);

  useEffect(() => {
    if (user?.uid) {
      return;
    }
    useStoriesRingStore.setState({ groups: [], seenIds: new Set<string>() });
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) {
        return;
      }
      const now = Date.now();
      if (now - lastFocusLoadAtRef.current < FOCUS_RELOAD_MIN_INTERVAL_MS) {
        return;
      }
      lastFocusLoadAtRef.current = now;
      void load();
    }, [load, user?.uid])
  );

  return null;
}
