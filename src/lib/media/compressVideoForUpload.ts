import { Platform } from "react-native";
import { devWarn } from "@/lib/devLog";

/** Reels: 720p, ~1.8 Mbps — hızlı başlangıç ve akıcı kaydırma. */
const VIDEO_COMPRESS_OPTIONS = {
  compressionMethod: "manual" as const,
  maxSize: 720,
  bitrate: 1_800_000,
  minimumFileSizeForCompress: 0,
};

export type VideoCompressProgress = (progress: number) => void;

/**
 * Cihazda video transcode (H.264). Web, Expo Go veya hata durumunda orijinal URI döner.
 * react-native-compressor yalnızca sıkıştırma anında yüklenir (tab/route init'i kırmaz).
 */
export async function compressVideoForUpload(
  localUri: string,
  onProgress?: VideoCompressProgress
): Promise<string> {
  if (Platform.OS === "web") {
    return localUri;
  }

  try {
    const { Video } = await import("react-native-compressor");
    return await Video.compress(
      localUri,
      VIDEO_COMPRESS_OPTIONS,
      (progress) => {
        if (typeof progress === "number" && !Number.isNaN(progress)) {
          onProgress?.(Math.min(1, Math.max(0, progress)));
        }
      }
    );
  } catch (error) {
    devWarn("[compressVideoForUpload] using original video:", error);
    return localUri;
  }
}
