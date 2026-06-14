import type { Post } from "../types";
import { isRepostPost } from "./repostUtils";

export function postBodyText(post: Post): string | null {
  if (isRepostPost(post)) {
    const text = post.repostCaption?.trim();
    return text || null;
  }
  const text = post.content?.trim();
  if (!text) {
    return post.mediaURL ? null : "—";
  }
  return text;
}
