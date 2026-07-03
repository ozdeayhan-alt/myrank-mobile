import { uploadFileToStorage } from "@/lib/media/uploadToStorage";
import { prepareImageForUpload } from "@/lib/media/prepareImageForUpload";
import type { MessageMediaType } from "../types";

export type UploadMessageMediaResult = {
  mediaURL: string;
};

export async function uploadMessageMedia(
  userId: string,
  localUri: string,
  type: MessageMediaType
): Promise<UploadMessageMediaResult> {
  if (type !== "image") {
    throw new Error("Only image uploads are supported.");
  }

  const stamp = Date.now();
  const prepared = await prepareImageForUpload(localUri, "message");
  const mediaURL = await uploadFileToStorage(
    `messages/${userId}/${stamp}.jpg`,
    prepared.uri,
    prepared.contentType,
    prepared.sizeBytes
  );
  return { mediaURL };
}
