import { uploadFileToStorage } from "@/lib/media/uploadToStorage";
import { prepareImageForUpload } from "@/lib/media/prepareImageForUpload";
import type { PostContentType } from "../types";

export type UploadPostMediaResult = {
  mediaURL: string;
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
  _mimeType?: string | null,
  options?: UploadPostMediaOptions
): Promise<UploadPostMediaResult> {
  if (contentType !== "image") {
    throw new Error("Only image uploads are supported.");
  }

  const stamp = Date.now();
  const onPrepareProgress = options?.onPrepareProgress;

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
