import { uploadPostMedia } from "@/features/posts/api/uploadPostMedia";
import { createPost } from "@/features/posts/api/createPost";
import { invalidateServerFeedCache } from "@/features/posts/api/invalidateServerFeedCache";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import {
  buildGlowCaption,
  buildWhispContent,
  classifyShareTarget,
  type ParsedSharePayload,
} from "./classifySharePayload";

function isNetworkError(error: unknown): boolean {
  const message = getUserFacingErrorMessage(error).toLowerCase();
  return (
    message.includes("bağlantı") ||
    message.includes("internet") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("zaman aşımı")
  );
}

async function createGlowFromLocalImage(
  userId: string,
  payload: ParsedSharePayload
): Promise<{ postId: string }> {
  if (!payload.localImagePath) {
    throw new Error("Görsel bulunamadı");
  }

  const uploaded = await uploadPostMedia(
    userId,
    payload.localImagePath,
    "image",
    payload.localImageMime
  );

  const created = await createPost(userId, {
    contentType: "image",
    content: buildGlowCaption(payload),
    mediaURL: uploaded.mediaURL,
    mediaWidth: uploaded.mediaWidth,
    mediaHeight: uploaded.mediaHeight,
  });

  return { postId: created.id };
}

export async function processSharePayload(
  userId: string,
  payload: ParsedSharePayload
): Promise<{ postId: string }> {
  const target = classifyShareTarget(payload);

  if (target === "flow") {
    if (!payload.url) {
      throw new Error("Video bağlantısı bulunamadı");
    }

    const created = await createPost(userId, {
      contentType: "flow",
      content: buildGlowCaption(payload),
      providerUrl: payload.url,
    });
    useFeedRefreshStore.getState().bump();
    void invalidateServerFeedCache();
    return { postId: created.id };
  }

  if (target === "image") {
    const result = await createGlowFromLocalImage(userId, payload);
    useFeedRefreshStore.getState().bump();
    void invalidateServerFeedCache();
    return result;
  }

  const content = buildWhispContent(payload);
  const created = await createPost(userId, {
    contentType: "tweet",
    content,
    ...(payload.url ? { linkUrl: payload.url } : {}),
  });
  useFeedRefreshStore.getState().bump();
  void invalidateServerFeedCache();
  return { postId: created.id };
}

export { isNetworkError };
