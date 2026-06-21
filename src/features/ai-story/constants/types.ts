export type StoryChipKey =
  | "peaceful"
  | "energetic"
  | "stressed"
  | "cool"
  | "romantic"
  | "focused"
  | "beach"
  | "city_night"
  | "nature"
  | "home"
  | "cafe"
  | "gym"
  | "walking"
  | "relaxing"
  | "having_fun"
  | "working"
  | "traveling"
  | "exercising";

export type StoryChip = {
  key: StoryChipKey;
  label: string;
};

export type StoryTemplate = {
  sceneId: string;
  name: string;
  type: string;
  backgroundUrl: string;
  overlays: string[];
  colorGrade: string;
  animationPreset: string;
};

export type AiStory = {
  id: string;
  userId: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  moodKey: string;
  locationKey: string;
  actionKey: string;
  caption: string | null;
  sceneId: string;
  template: StoryTemplate;
  status: "completed";
  sharedPostId: string | null;
  createdAt: number | null;
  expiresAt: number | null;
};

export const CAPTION_MAX_LENGTH = 40;

export const STORY_DURATION_MS = 5000;
