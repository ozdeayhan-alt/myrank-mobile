import type { Post } from "../types";
import { isRepostPost, resolveEmbeddedOriginalPost } from "./repostUtils";

export type PostStoryMedia = {
  mediaType: "image" | "video";
  mediaURL: string;
  posterURL?: string | null;
};

export function resolvePostStoryMedia(post: Post): PostStoryMedia | null {
  const target = isRepostPost(post) ? resolveEmbeddedOriginalPost(post) : post;
  if (!target?.mediaURL?.trim()) {
    return null;
  }

  if (target.contentType === "image") {
    return {
      mediaType: "image",
      mediaURL: target.mediaURL.trim(),
      posterURL: target.posterURL?.trim() || null,
    };
  }

  if (target.contentType === "video") {
    return {
      mediaType: "video",
      mediaURL: target.mediaURL.trim(),
      posterURL: target.posterURL?.trim() || null,
    };
  }

  return null;
}

export function canSharePostToStory(post: Post): boolean {
  return resolvePostStoryMedia(post) !== null;
}
