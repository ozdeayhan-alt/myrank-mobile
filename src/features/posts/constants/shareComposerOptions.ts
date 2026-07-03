import type { ShareContentType } from "../types";
import {
  CONTENT_TYPE_LABELS,
  SHARE_COMPOSER_HINTS,
} from "./contentTypeLabels";

export type ShareComposerOption = {
  type: ShareContentType;
  label: string;
  hint: string;
  icon: "chatbubble-outline" | "image-outline";
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
];
