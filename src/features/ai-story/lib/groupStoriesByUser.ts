import type { AiStory } from "../constants/types";

export type StoryUserGroup = {
  userId: string;
  displayName: string;
  photoURL: string | null;
  stories: AiStory[];
  latestCreatedAt: number;
};

export function groupStoriesByUser(stories: AiStory[]): StoryUserGroup[] {
  const map = new Map<string, StoryUserGroup>();

  for (const story of stories) {
    const createdAt = story.createdAt ?? 0;
    const existing = map.get(story.userId);
    if (existing) {
      existing.stories.push(story);
      if (createdAt > existing.latestCreatedAt) {
        existing.latestCreatedAt = createdAt;
      }
      continue;
    }

    map.set(story.userId, {
      userId: story.userId,
      displayName: story.authorDisplayName,
      photoURL: story.authorPhotoURL,
      stories: [story],
      latestCreatedAt: createdAt,
    });
  }

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      stories: [...group.stories].sort(
        (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
      ),
    }))
    .sort((a, b) => b.latestCreatedAt - a.latestCreatedAt);
}
