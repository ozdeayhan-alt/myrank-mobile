import { useMemo } from "react";
import {
  EMPTY_AUTHOR_STORY_RING,
  useStoriesRingStore,
} from "../store/useStoriesRingStore";

export function useAuthorStoryRing(
  userId: string | null | undefined
): typeof EMPTY_AUTHOR_STORY_RING {
  const groups = useStoriesRingStore((state) => state.groups);

  return useMemo(() => {
    if (!userId) {
      return EMPTY_AUTHOR_STORY_RING;
    }

    const group = groups.find((entry) => entry.userId === userId);
    if (!group || group.stories.length === 0) {
      return EMPTY_AUTHOR_STORY_RING;
    }

    return {
      hasStories: true,
      hasUnseen: group.hasUnseen,
      firstStoryId: group.stories[0]?.id ?? null,
    };
  }, [groups, userId]);
}
