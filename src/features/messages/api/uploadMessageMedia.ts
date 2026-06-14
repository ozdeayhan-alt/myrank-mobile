import { uploadFileToStorage } from "@/lib/media/uploadToStorage";
import { prepareImageForUpload } from "@/lib/media/prepareImageForUpload";
import type { MessageMediaType } from "../types";

export type UploadMessageMediaResult = {
  mediaURL: string;
  posterURL?: string;
};

export async function uploadMessageMedia(
  userId: string,
  localUri: string,
  type: MessageMediaType,
  mimeType?: string | null
): Promise<UploadMessageMediaResult> {
  const stamp = Date.now();

  if (type === "image") {
    const prepared = await prepareImageForUpload(localUri, "message");
    const mediaURL = await uploadFileToStorage(
      `messages/${userId}/${stamp}.jpg`,
      prepared.uri,
      prepared.contentType,
      prepared.sizeBytes
    );
    return { mediaURL };
  }

  const { prepareVideoForUpload } = await import(
    "@/lib/media/prepareVideoForUpload"
  );
  const prepared = await prepareVideoForUpload(localUri, mimeType);
  const videoPath = `messages/${userId}/${stamp}.${prepared.videoExtension}`;
  const posterPath = `messages/${userId}/${stamp}_poster.jpg`;

  const mediaURL = await uploadFileToStorage(
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
    } catch {
      // optional poster
    }
  }

  return { mediaURL, posterURL };
}
