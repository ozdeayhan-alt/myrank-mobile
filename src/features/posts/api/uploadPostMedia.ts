import { devWarn } from "@/lib/devLog";
import { derivePosterUrlFromMediaUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { uploadFileToStorage } from "@/lib/media/uploadToStorage";
import { prepareImageForUpload } from "@/lib/media/prepareImageForUpload";
import type { PostContentType } from "../types";
import { processUploadedVideo } from "./processUploadedVideo";

export type UploadPostMediaResult = {
  mediaURL: string;
  hlsURL?: string;
  posterURL?: string;
  mediaWidth?: number;
  mediaHeight?: number;
};

export type UploadPostMediaOptions = {
  onPrepareProgress?: (message: string, progress?: number) => void;
};

export async function uploadPostMedia(
  userId: string,
  localUri: string,
  contentType: PostContentType,
  mimeType?: string | null,
  options?: UploadPostMediaOptions
): Promise<UploadPostMediaResult> {
  const stamp = Date.now();
  const onPrepareProgress = options?.onPrepareProgress;

  if (contentType === "video") {
    const { prepareVideoForUpload } = await import(
      "@/lib/media/prepareVideoForUpload"
    );
    const prepared = await prepareVideoForUpload(localUri, mimeType, {
      onProgress: onPrepareProgress,
    });
    const videoPath = `posts/${userId}/${stamp}.${prepared.videoExtension}`;
    const posterPath = `posts/${userId}/${stamp}_poster.jpg`;

    onPrepareProgress?.("Video yükleniyor…", 0);

    const rawMediaURL = await uploadFileToStorage(
      videoPath,
      prepared.videoUri,
      prepared.videoContentType,
      prepared.videoSizeBytes
    );

    let posterURL: string | undefined;

    if (
      prepared.posterUri &&
      prepared.posterContentType &&
      prepared.posterSizeBytes != null
    ) {
      try {
        posterURL = await uploadFileToStorage(
          posterPath,
          prepared.posterUri,
          prepared.posterContentType,
          prepared.posterSizeBytes
        );
      } catch (error) {
        devWarn("[uploadPostMedia] client poster upload skipped:", error);
      }
    }

    onPrepareProgress?.("Video optimize ediliyor…", 0.92);

    let mediaURL = rawMediaURL;
    let hlsURL: string | undefined;

    try {
      const processed = await processUploadedVideo(videoPath);
      mediaURL = processed.mediaURL;
      hlsURL = processed.hlsURL;
      posterURL = processed.posterURL ?? posterURL;
    } catch (error) {
      devWarn(
        "[uploadPostMedia] server processing failed, using raw upload:",
        error
      );
    }

    return {
      mediaURL,
      hlsURL,
      posterURL:
        posterURL ??
        derivePosterUrlFromMediaUrl(mediaURL) ??
        derivePosterUrlFromMediaUrl(rawMediaURL),
      ...(prepared.posterWidth && prepared.posterHeight
        ? {
            mediaWidth: prepared.posterWidth,
            mediaHeight: prepared.posterHeight,
          }
        : prepared.videoWidth && prepared.videoHeight
          ? {
              mediaWidth: prepared.videoWidth,
              mediaHeight: prepared.videoHeight,
            }
          : {}),
    };
  }

  onPrepareProgress?.("Görsel hazırlanıyor…", 0);

  const prepared = await prepareImageForUpload(localUri, "post");

  onPrepareProgress?.("Görsel yükleniyor…", 0.5);

  const mediaURL = await uploadFileToStorage(
    `posts/${userId}/${stamp}.jpg`,
    prepared.uri,
    prepared.contentType,
    prepared.sizeBytes
  );

  return {
    mediaURL,
    mediaWidth: prepared.width,
    mediaHeight: prepared.height,
  };
}
