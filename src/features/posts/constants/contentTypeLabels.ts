import type { PostContentType } from "../types";

export type BrandedPostContentType = Exclude<PostContentType, "repost">;

export const CONTENT_TYPE_LABELS: Record<BrandedPostContentType, string> = {
  tweet: "Whisp",
  image: "Glow",
  video: "Flow",
};

export const SHARE_COMPOSER_HINTS: Record<BrandedPostContentType, string> = {
  tweet: "En fazla 280 karakter",
  image: "Galeriden görsel seç",
  video: "Galeriden video seç (max 33 sn)",
};

export const SHARE_HUB_SUBTITLES: Record<BrandedPostContentType, string> = {
  tweet: "280 karaktere kadar metin paylaş",
  image: "Galeriden görsel yükle",
  video: "En fazla 33 saniyelik video",
};

export const SHARE_COMPOSER_PLACEHOLDERS: Record<BrandedPostContentType, string> =
  {
    tweet: "Ne fısıldamak istersin?",
    image: "Işıltına bir Whisp bırak",
    video: "Flow'un ne hakkında? Bir Whisp bırak.",
  };

export function getShareComposerPlaceholder(
  contentType: BrandedPostContentType
): string {
  return SHARE_COMPOSER_PLACEHOLDERS[contentType];
}

export function getContentTypeLabel(
  contentType: PostContentType | undefined | null,
  fallback = "Gönderi"
): string {
  if (!contentType || contentType === "repost") {
    return fallback;
  }

  return CONTENT_TYPE_LABELS[contentType];
}

export function getEmptyFeedMessage(filter: BrandedPostContentType): string {
  return `Bu akışta henüz ${CONTENT_TYPE_LABELS[filter]} yok.`;
}

export function getWhispTextRequiredMessage(): string {
  return `${CONTENT_TYPE_LABELS.tweet} metni boş olamaz.`;
}

export function getWhispMaxLengthMessage(maxLength: number): string {
  return `${CONTENT_TYPE_LABELS.tweet} en fazla ${maxLength} karakter olabilir.`;
}
