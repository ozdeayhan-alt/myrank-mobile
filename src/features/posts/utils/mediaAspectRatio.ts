/** Feed medya kutusu üst sınırı (px). */
export const MAX_FEED_MEDIA_HEIGHT = 300;

/** Aşırı uç oranları keser; yönü (yatay/dikey) korur. */
const MIN_ASPECT_RATIO = 0.25;
const MAX_ASPECT_RATIO = 4;

export function normalizeAspectRatio(width: number, height: number): number {
  if (width <= 0 || height <= 0) {
    return 1;
  }
  const ratio = width / height;
  return Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, ratio));
}

/** @deprecated Use normalizeAspectRatio */
export function clampAspectRatio(width: number, height: number): number {
  return normalizeAspectRatio(width, height);
}

export type FeedMediaLayout = {
  width: number;
  height: number;
  containerWidth: number;
};

/** Gerçek en-boy oranına göre boyut; yükseklik maxHeight ile sınırlı. */
export function feedMediaLayout(
  containerWidth: number,
  aspectRatio: number,
  maxHeight: number
): FeedMediaLayout {
  if (containerWidth <= 0 || aspectRatio <= 0) {
    return {
      width: containerWidth,
      height: Math.min(containerWidth, maxHeight),
      containerWidth,
    };
  }

  const naturalHeight = containerWidth / aspectRatio;
  if (naturalHeight <= maxHeight) {
    return {
      width: containerWidth,
      height: naturalHeight,
      containerWidth,
    };
  }

  return {
    width: maxHeight * aspectRatio,
    height: maxHeight,
    containerWidth,
  };
}

/** @deprecated Use feedMediaLayout */
export function mediaHeightForWidth(
  containerWidth: number,
  aspectRatio: number
): number {
  return feedMediaLayout(containerWidth, aspectRatio, MAX_FEED_MEDIA_HEIGHT)
    .height;
}
