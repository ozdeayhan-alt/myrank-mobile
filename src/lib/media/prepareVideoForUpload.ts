import * as FileSystem from "expo-file-system/legacy";
import { assertValidMp4File } from "./assertValidMp4";
import { assertVideoSize } from "./mediaLimits";
import { compressVideoForUpload } from "./compressVideoForUpload";
import { generateVideoPosterUri } from "./generateVideoPoster";
import { prepareImageForUpload } from "./prepareImageForUpload";
import { resolveReadableUri } from "./uriToBlob";
import { devWarn } from "@/lib/devLog";

export type PreparedVideoUpload = {
  videoUri: string;
  videoContentType: string;
  videoSizeBytes: number;
  videoExtension: string;
  posterUri?: string;
  posterContentType?: "image/jpeg";
  posterSizeBytes?: number;
  posterWidth?: number;
  posterHeight?: number;
  videoWidth?: number;
  videoHeight?: number;
};

export type PrepareVideoOptions = {
  onProgress?: (message: string, progress?: number) => void;
};

export async function prepareVideoForUpload(
  localUri: string,
  mimeType?: string | null,
  options?: PrepareVideoOptions
): Promise<PreparedVideoUpload> {
  void mimeType;
  const report = (message: string, progress?: number) => {
    options?.onProgress?.(message, progress);
  };

  report("Video hazırlanıyor…", 0);

  const sourceUri = await resolveReadableUri(localUri);
  const sourceInfo = await FileSystem.getInfoAsync(sourceUri);

  if (!sourceInfo.exists || typeof sourceInfo.size !== "number") {
    throw new Error("Video dosyası okunamadı.");
  }

  assertVideoSize(sourceInfo.size);

  report("Video sıkıştırılıyor…", 0.05);

  const compressedUri = await compressVideoForUpload(sourceUri, (p) => {
    report("Video sıkıştırılıyor…", 0.05 + p * 0.7);
  });

  let uploadableUri =
    compressedUri.startsWith("file://") || compressedUri.startsWith("/")
      ? compressedUri
      : await resolveReadableUri(compressedUri);

  try {
    uploadableUri = await assertValidMp4File(uploadableUri);
  } catch (compressValidationError) {
    devWarn(
      "[prepareVideoForUpload] compressed MP4 invalid, using source:",
      compressValidationError
    );
    uploadableUri = await assertValidMp4File(sourceUri);
  }

  const info = await FileSystem.getInfoAsync(uploadableUri);

  if (!info.exists || typeof info.size !== "number") {
    throw new Error("Yüklenecek video okunamadı.");
  }

  assertVideoSize(info.size);

  report("Kapak görseli oluşturuluyor…", 0.85);

  const thumb = await generateVideoPosterUri(sourceUri, uploadableUri);

  let posterUri: string | undefined;
  let posterContentType: "image/jpeg" | undefined;
  let posterSizeBytes: number | undefined;
  let posterWidth: number | undefined;
  let posterHeight: number | undefined;
  let videoWidth: number | undefined;
  let videoHeight: number | undefined;

  if (thumb) {
    videoWidth = thumb.width;
    videoHeight = thumb.height;

    try {
      const poster = await prepareImageForUpload(thumb.uri, "poster");
      posterUri = poster.uri;
      posterContentType = poster.contentType;
      posterSizeBytes = poster.sizeBytes;
      posterWidth = poster.width;
      posterHeight = poster.height;
    } catch (error) {
      devWarn("[prepareVideoForUpload] poster prepare skipped:", error);
    }
  } else {
    devWarn(
      "[prepareVideoForUpload] client thumbnail skipped — server will generate"
    );
  }

  report("Yükleme için hazır", 1);

  return {
    videoUri: uploadableUri,
    videoContentType: "video/mp4",
    videoSizeBytes: info.size,
    videoExtension: "mp4",
    posterUri,
    posterContentType,
    posterSizeBytes,
    posterWidth,
    posterHeight,
    videoWidth,
    videoHeight,
  };
}
