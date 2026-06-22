import type { Story } from "../constants/types";
import { groupStoriesByUser } from "./groupStoriesByUser";

export type StoryPlaylistScope = "singleUser" | "ring";

/** Tek kullanıcının story'leri — profil / halka tıklaması. */
export function buildSingleUserStoryPlaylist(
  feed: Story[],
  userId: string
): Story[] {
  return feed
    .filter((story) => story.userId === userId)
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
}

/**
 * Instagram-style playlist: self first, then other users in feed ring order.
 * Within each user, stories are chronological (oldest first).
 */
export function buildStoryRingPlaylist(
  feed: Story[],
  currentUserId: string | null | undefined
): Story[] {
  if (!feed.length) {
    return [];
  }

  const groups = groupStoriesByUser(feed);
  const selfGroup =
    currentUserId != null
      ? groups.find((group) => group.userId === currentUserId) ?? null
      : null;
  const otherGroups =
    currentUserId != null
      ? groups.filter((group) => group.userId !== currentUserId)
      : groups;

  const orderedGroups = [...(selfGroup ? [selfGroup] : []), ...otherGroups];
  return orderedGroups.flatMap((group) => group.stories);
}

export function findStoryIndexInPlaylist(
  playlist: Story[],
  storyId: string | null | undefined
): number {
  if (!storyId) {
    return 0;
  }
  const index = playlist.findIndex((story) => story.id === storyId);
  return Math.max(index, 0);
}

export async function resolveStoryRingPlaylist(
  feed: Story[],
  currentUserId: string | null | undefined,
  options: {
    storyId?: string | null;
    userId?: string | null;
    scope?: StoryPlaylistScope;
    fetchStoryById: (storyId: string) => Promise<Story>;
  }
): Promise<{ playlist: Story[]; initialIndex: number }> {
  let workingFeed = [...feed];
  const scope = options.scope ?? "ring";

  if (options.storyId && !workingFeed.some((s) => s.id === options.storyId)) {
    try {
      const story = await options.fetchStoryById(options.storyId);
      if (!options.userId || story.userId === options.userId) {
        workingFeed = [story, ...workingFeed];
      }
    } catch {
      // keep feed as-is
    }
  }

  const targetUserId = options.userId?.trim();
  let playlist =
    scope === "singleUser" && targetUserId
      ? buildSingleUserStoryPlaylist(workingFeed, targetUserId)
      : buildStoryRingPlaylist(workingFeed, currentUserId);

  if (playlist.length === 0 && options.storyId) {
    const story = await options.fetchStoryById(options.storyId);
    if (
      scope === "ring" ||
      !targetUserId ||
      story.userId === targetUserId
    ) {
      return { playlist: [story], initialIndex: 0 };
    }
  }

  const initialIndex = findStoryIndexInPlaylist(playlist, options.storyId);
  return { playlist, initialIndex };
}
