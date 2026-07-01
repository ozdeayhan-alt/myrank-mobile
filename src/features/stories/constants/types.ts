export type StoryMediaType = "image" | "video";

export type Story = {
  id: string;
  userId: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  mediaType: StoryMediaType;
  mediaURL: string;
  posterURL: string | null;
  caption: string | null;
  createdAt: number | null;
  expiresAt: number | null;
  viewCount?: number;
  heartLikeCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  storyScore?: number;
};

export type StoryActorSummary = {
  userId: string;
  displayName: string;
  photoURL: string | null;
  at: number | null;
};

export type StoryInsights = {
  storyId: string;
  viewCount: number;
  heartLikeCount: number;
  storyScore: number;
  viewers: StoryActorSummary[];
  likers: StoryActorSummary[];
};

export type StoryEngagement = {
  storyId: string;
  liked: boolean;
  voteNet: number;
};

export type StoryVoteCounts = {
  likeCount: number;
  dislikeCount: number;
};

export const CAPTION_MAX_LENGTH = 40;
export const STORY_IMAGE_DURATION_MS = 7000;
export const STORY_VIDEO_MAX_DURATION_MS = 15000;
