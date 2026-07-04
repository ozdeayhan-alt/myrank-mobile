/** Manipulate sonrası resim üst sınırı */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function assertImageSize(bytes: number): void {
  if (bytes > IMAGE_MAX_BYTES) {
    throw new Error(
      `Resim en fazla ${Math.round(IMAGE_MAX_BYTES / (1024 * 1024))} MB olabilir. Daha küçük bir görsel seçin.`
    );
  }
}
