/** Manipulate sonrası resim üst sınırı */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Ham video üst sınırı (sıkıştırma öncesi) */
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

/** Sıkıştırma sonrası hedef: ~8–15 MB / 33 sn (720p, ~3.5 Mbps) */
export const VIDEO_TARGET_MAX_BYTES = 18 * 1024 * 1024;

export const ALLOWED_UPLOAD_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
] as const;

export type AllowedUploadContentType =
  (typeof ALLOWED_UPLOAD_CONTENT_TYPES)[number];

export function assertImageSize(bytes: number): void {
  if (bytes > IMAGE_MAX_BYTES) {
    throw new Error(
      `Resim en fazla ${Math.round(IMAGE_MAX_BYTES / (1024 * 1024))} MB olabilir. Daha küçük bir görsel seçin.`
    );
  }
}

export function assertVideoSize(bytes: number): void {
  if (bytes > VIDEO_MAX_BYTES) {
    throw new Error(
      `Video en fazla ${Math.round(VIDEO_MAX_BYTES / (1024 * 1024))} MB olabilir. Daha kısa veya düşük çözünürlüklü bir video seçin.`
    );
  }
}
