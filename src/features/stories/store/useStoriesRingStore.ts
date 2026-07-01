import { create } from "zustand";
import { prefetchStoryRingMedia } from "@/features/posts/utils/prefetchFeedExtras";
import { fetchStoriesFeed } from "../api/fetchStoriesFeed";
import {
  groupStoriesByUser,
  type StoryUserGroup,
} from "../lib/groupStoriesByUser";
import { getSeenStoryIds } from "../lib/storySeenStorage";

export type AuthorStoryRing = {
  hasStories: boolean;
  hasUnseen: boolean;
  firstStoryId: string | null;
};

export const EMPTY_AUTHOR_STORY_RING: AuthorStoryRing = {
  hasStories: false,
  hasUnseen: false,
  firstStoryId: null,
};

type StoriesRingState = {
  groups: StoryUserGroup[];
  seenIds: Set<string>;
  loading: boolean;
  load: () => Promise<void>;
  reload: () => Promise<void>;
  markStorySeenLocally: (storyId: string) => void;
};

let loadInFlight: Promise<void> | null = null;

export const useStoriesRingStore = create<StoriesRingState>((set, get) => ({
  groups: [],
  seenIds: new Set<string>(),
  loading: false,
  load: async () => {
    if (loadInFlight) {
      return loadInFlight;
    }

    set({ loading: true });
    loadInFlight = (async () => {
      try {
        const [stories, seenIds] = await Promise.all([
          fetchStoriesFeed(),
          getSeenStoryIds(),
        ]);
        const grouped = groupStoriesByUser(stories, seenIds);
        set({
          groups: grouped,
          seenIds,
          loading: false,
        });
        prefetchStoryRingMedia(grouped);
      } catch {
        set({ loading: false });
      } finally {
        loadInFlight = null;
      }
    })();

    return loadInFlight;
  },
  reload: async () => {
    loadInFlight = null;
    await get().load();
  },
  markStorySeenLocally: (storyId: string) => {
    if (!storyId.trim()) {
      return;
    }
    const state = get();
    if (state.seenIds.has(storyId)) {
      return;
    }
    const seenIds = new Set(state.seenIds);
    seenIds.add(storyId);
    const stories = state.groups.flatMap((group) => group.stories);
    set({
      seenIds,
      groups: groupStoriesByUser(stories, seenIds),
    });
  },
}));
