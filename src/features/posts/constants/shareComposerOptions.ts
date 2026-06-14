import type { PostContentType } from "../types";

export type ShareComposerOption = {
  type: PostContentType;
  label: string;
  hint: string;
  icon: "chatbubble-outline" | "image-outline" | "videocam-outline";
};

export const SHARE_COMPOSER_OPTIONS: ShareComposerOption[] = [
  {
    type: "tweet",
    label: "Tweet",
    hint: "En fazla 280 karakter",
    icon: "chatbubble-outline",
  },
  {
    type: "image",
    label: "Fotoğraf",
    hint: "Galeriden fotoğraf seç",
    icon: "image-outline",
  },
  {
    type: "video",
    label: "Video",
    hint: "Galeriden video seç (max 33 sn)",
    icon: "videocam-outline",
  },
];
