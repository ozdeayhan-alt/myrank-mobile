import { uploadFileToStorage } from "@/lib/media/uploadToStorage";
import { prepareImageForUpload } from "@/lib/media/prepareImageForUpload";
import type { StoryMediaType } from "../constants/types";

export type UploadStoryMediaResult = {
  mediaType: StoryMediaType;
  mediaURL: string;
  posterURL?: string;
};

export async function uploadStoryMedia(
  userId: string,
  localUri: string,
  mediaType: StoryMediaType,
  mimeType?: string | null
): Promise<UploadStoryMediaResult> {
  const stamp = Date.now();

  if (mediaType === "image") {
    const prepared = await prepareImageForUpload(localUri, "post");
    const mediaURL = await uploadFileToStorage(
      `stories/${userId}/${stamp}.jpg`,
      prepared.uri,
      prepared.contentType,
      prepared.sizeBytes
    );
    return { mediaType, mediaURL };
  }

  const { prepareVideoForUpload } = await import(
    "@/lib/media/prepareVideoForUpload"
  );
  const prepared = await prepareVideoForUpload(localUri, mimeType);
  const videoPath = `stories/${userId}/${stamp}.${prepared.videoExtension}`;
  const posterPath = `stories/${userId}/${stamp}_poster.jpg`;

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

  return { mediaType, mediaURL, posterURL };
}
