import { useCallback, useEffect, useState } from "react";
import { fetchStoriesFeed } from "../api/fetchStoriesFeed";
import { getSeenStoryIds } from "../lib/storySeenStorage";
import type { Story } from "../constants/types";

export type UserStoryAvailability = {
  hasStories: boolean;
  hasUnseen: boolean;
  firstStoryId: string | null;
  stories: Story[];
  loading: boolean;
  reload: () => void;
};

function sortStories(stories: Story[]): Story[] {
  return [...stories].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
}

export function useUserStoryAvailability(
  userId: string | null | undefined,
  reloadSignal = 0
): UserStoryAvailability {
  const [stories, setStories] = useState<Story[]>([]);
  const [seenStoryIds, setSeenStoryIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(Boolean(userId));
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setStories([]);
      setSeenStoryIds(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const [feed, seenIds] = await Promise.all([
          fetchStoriesFeed(),
          getSeenStoryIds(),
        ]);
        if (cancelled) {
          return;
        }
        setStories(sortStories(feed.filter((story) => story.userId === userId)));
        setSeenStoryIds(seenIds);
      } catch {
        if (!cancelled) {
          setStories([]);
          setSeenStoryIds(new Set());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadSignal, tick]);

  const hasUnseen = stories.some((story) => !seenStoryIds.has(story.id));

  return {
    hasStories: stories.length > 0,
    hasUnseen,
    firstStoryId: stories[0]?.id ?? null,
    stories,
    loading,
    reload,
  };
}
