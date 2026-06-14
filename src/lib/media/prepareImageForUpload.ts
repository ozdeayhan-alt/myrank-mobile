import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { assertImageSize } from "./mediaLimits";
import { resolveReadableUri } from "./uriToBlob";

export type ImageUploadPreset = "post" | "avatar" | "poster" | "message";

const PRESET_CONFIG: Record<
  ImageUploadPreset,
  { maxWidth: number; compress: number }
> = {
  post: { maxWidth: 1080, compress: 0.78 },
  avatar: { maxWidth: 400, compress: 0.8 },
  poster: { maxWidth: 720, compress: 0.75 },
  message: { maxWidth: 1080, compress: 0.78 },
};

export type PreparedImageUpload = {
  uri: string;
  contentType: "image/jpeg";
  sizeBytes: number;
  width: number;
  height: number;
};

async function fileSizeBytes(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || typeof info.size !== "number") {
    throw new Error("Görsel dosyası okunamadı.");
  }
  return info.size;
}

export async function prepareImageForUpload(
  localUri: string,
  preset: ImageUploadPreset
): Promise<PreparedImageUpload> {
  const readableUri = await resolveReadableUri(localUri);
  const config = PRESET_CONFIG[preset];

  let result = await ImageManipulator.manipulateAsync(
    readableUri,
    [{ resize: { width: config.maxWidth } }],
    {
      compress: config.compress,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  let sizeBytes = await fileSizeBytes(result.uri);

  if (sizeBytes > 5 * 1024 * 1024) {
    result = await ImageManipulator.manipulateAsync(result.uri, [], {
      compress: 0.65,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    sizeBytes = await fileSizeBytes(result.uri);
  }

  assertImageSize(sizeBytes);

  return {
    uri: result.uri,
    contentType: "image/jpeg",
    sizeBytes,
    width: result.width,
    height: result.height,
  };
}
