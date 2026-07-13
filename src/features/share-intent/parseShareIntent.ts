import type { ShareIntent } from "expo-share-intent";
import {
  buildDedupeKey,
  extractUrlFromShareText,
  type ParsedSharePayload,
} from "./classifySharePayload";

export function parseShareIntent(shareIntent: ShareIntent): ParsedSharePayload | null {
  const text = String(shareIntent.text ?? "").trim();
  const webUrl = String(shareIntent.webUrl ?? "").trim();
  const metaTitle =
    typeof shareIntent.meta?.title === "string"
      ? shareIntent.meta.title.trim()
      : null;

  const imageFile = (shareIntent.files ?? []).find((file) =>
    String(file.mimeType ?? "").startsWith("image/")
  );

  const url = webUrl || extractUrlFromShareText(text) || null;

  if (!text && !url && !imageFile?.path) {
    return null;
  }

  const payload: ParsedSharePayload = {
    dedupeKey: "",
    text,
    url,
    localImagePath: imageFile?.path ?? null,
    localImageMime: imageFile?.mimeType ?? null,
    metaTitle,
  };

  payload.dedupeKey = buildDedupeKey(payload);
  return payload;
}
