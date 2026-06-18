import type { PostContentType } from "../types";
import {
  CONTENT_TYPE_LABELS,
  SHARE_COMPOSER_HINTS,
} from "./contentTypeLabels";

export type ShareComposerOption = {
  type: PostContentType;
  label: string;
  hint: string;
  icon: "chatbubble-outline" | "image-outline" | "videocam-outline";
};

export const SHARE_COMPOSER_OPTIONS: ShareComposerOption[] = [
  {
    type: "tweet",
    label: CONTENT_TYPE_LABELS.tweet,
    hint: SHARE_COMPOSER_HINTS.tweet,
    icon: "chatbubble-outline",
  },
  {
    type: "image",
    label: CONTENT_TYPE_LABELS.image,
    hint: SHARE_COMPOSER_HINTS.image,
    icon: "image-outline",
  },
  {
    type: "video",
    label: CONTENT_TYPE_LABELS.video,
    hint: SHARE_COMPOSER_HINTS.video,
    icon: "videocam-outline",
  },
];
