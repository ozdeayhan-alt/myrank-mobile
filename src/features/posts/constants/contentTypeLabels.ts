import type { ShareContentType } from "../types";
import type { HomeContentFilter } from "../utils/filterPostsByContentType";

export type BrandedPostContentType = ShareContentType;

export const CONTENT_TYPE_LABELS: Record<BrandedPostContentType, string> = {
  tweet: "Whisp",
  image: "Glow",
  flow: "Flow",
};

export const SHARE_COMPOSER_HINTS: Record<BrandedPostContentType, string> = {
  tweet: "En fazla 280 karakter",
  image: "Galeriden görsel seç",
  flow: "Video bağlantısı (yorum isteğe bağlı)",
};

export const SHARE_HUB_SUBTITLES: Record<BrandedPostContentType, string> = {
  tweet: "280 karaktere kadar metin paylaş",
  image: "Galeriden görsel yükle",
  flow: "YouTube veya desteklenen platform linki",
};

export const SHARE_COMPOSER_PLACEHOLDERS: Record<BrandedPostContentType, string> =
  {
    tweet: "Ne fısıldamak istersin?",
    image: "Işıltına bir Whisp bırak",
    flow: "İsteğe bağlı yorum…",
  };

export function getShareComposerPlaceholder(
  contentType: BrandedPostContentType
): string {
  return SHARE_COMPOSER_PLACEHOLDERS[contentType];
}

export function getContentTypeLabel(
  contentType: string | undefined | null,
  fallback = "Gönderi"
): string {
  if (!contentType || contentType === "repost" || contentType === "video") {
    return fallback;
  }

  if (contentType === "flow") {
    return CONTENT_TYPE_LABELS.flow;
  }

  if (contentType in CONTENT_TYPE_LABELS) {
    return CONTENT_TYPE_LABELS[contentType as BrandedPostContentType];
  }

  return fallback;
}

export function getEmptyFeedMessage(filter: HomeContentFilter): string {
  if (filter === "flow") {
    return "Bu akışta henüz Flow yok.";
  }
  return `Bu akışta henüz ${CONTENT_TYPE_LABELS[filter]} yok.`;
}

export function getWhispTextRequiredMessage(): string {
  return `${CONTENT_TYPE_LABELS.tweet} metni boş olamaz.`;
}

export function getWhispMaxLengthMessage(maxLength: number): string {
  return `${CONTENT_TYPE_LABELS.tweet} en fazla ${maxLength} karakter olabilir.`;
}
