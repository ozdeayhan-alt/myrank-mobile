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
};

export const CAPTION_MAX_LENGTH = 40;
export const STORY_IMAGE_DURATION_MS = 7000;
export const STORY_VIDEO_MAX_DURATION_MS = 15000;
