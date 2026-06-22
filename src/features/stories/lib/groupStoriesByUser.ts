import type { Story } from "../constants/types";

export type StoryUserGroup = {
  userId: string;
  displayName: string;
  photoURL: string | null;
  stories: Story[];
  hasUnseen: boolean;
};

export function groupStoriesByUser(
  stories: Story[],
  seenStoryIds: Set<string> = new Set()
): StoryUserGroup[] {
  const byUser = new Map<string, StoryUserGroup>();

  for (const story of stories) {
    const existing = byUser.get(story.userId);
    if (existing) {
      existing.stories.push(story);
      if (!seenStoryIds.has(story.id)) {
        existing.hasUnseen = true;
      }
      continue;
    }

    byUser.set(story.userId, {
      userId: story.userId,
      displayName: story.authorDisplayName,
      photoURL: story.authorPhotoURL,
      stories: [story],
      hasUnseen: !seenStoryIds.has(story.id),
    });
  }

  return Array.from(byUser.values()).map((group) => ({
    ...group,
    stories: group.stories.sort(
      (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
    ),
  }));
}
