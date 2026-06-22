import { useCallback, useEffect } from "react";
import { useAuthorStoryRing } from "./useAuthorStoryRing";
import { useStoriesRingStore } from "../store/useStoriesRingStore";
import type { Story } from "../constants/types";

export type UserStoryAvailability = {
  hasStories: boolean;
  hasUnseen: boolean;
  firstStoryId: string | null;
  stories: Story[];
  loading: boolean;
  reload: () => void;
};

export function useUserStoryAvailability(
  userId: string | null | undefined,
  reloadSignal = 0
): UserStoryAvailability {
  const ring = useAuthorStoryRing(userId);
  const loading = useStoriesRingStore((state) => state.loading);
  const groups = useStoriesRingStore((state) => state.groups);
  const reloadStore = useStoriesRingStore((state) => state.reload);

  const reload = useCallback(() => {
    void reloadStore();
  }, [reloadStore]);

  useEffect(() => {
    void reloadStore();
  }, [reloadSignal, reloadStore]);

  const stories =
    userId != null
      ? (groups.find((group) => group.userId === userId)?.stories ?? [])
      : [];

  return {
    ...ring,
    stories,
    loading,
    reload,
  };
}
