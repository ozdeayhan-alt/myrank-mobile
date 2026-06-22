import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { useStoriesRingStore } from "../store/useStoriesRingStore";

export function StoriesRingBootstrap() {
  const { user } = useAuth();
  const load = useStoriesRingStore((state) => state.load);

  useEffect(() => {
    if (user?.uid) {
      void load();
      return;
    }
    useStoriesRingStore.setState({ groups: [] });
  }, [load, user?.uid]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        void load();
      }
    }, [load, user?.uid])
  );

  return null;
}
