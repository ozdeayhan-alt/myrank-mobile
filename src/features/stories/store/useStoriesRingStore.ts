import { create } from "zustand";
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
  loading: boolean;
  load: () => Promise<void>;
  reload: () => Promise<void>;
};

let loadInFlight: Promise<void> | null = null;

export const useStoriesRingStore = create<StoriesRingState>((set, get) => ({
  groups: [],
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
        set({
          groups: groupStoriesByUser(stories, seenIds),
          loading: false,
        });
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
}));
