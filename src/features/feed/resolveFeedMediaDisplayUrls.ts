import type { Post } from "@/features/posts/types";
import {
  resolveMediaDisplayUrl,
  resolveVideoPosterUrl,
} from "@/lib/media/resolveMediaDisplayUrl";
import { isRepostPost, resolveEmbeddedOriginalPost } from "@/features/posts/utils/repostUtils";
import { isVideoPost } from "@/features/posts/utils/videoPosts";

export type FeedMediaDisplayUrls = {
  previewUri: string | undefined;
  fullUri: string | undefined;
};

export function resolveFeedMediaDisplayUrls(post: Post): FeedMediaDisplayUrls {
  if (isRepostPost(post)) {
    const embedded = resolveEmbeddedOriginalPost(post);
    if (embedded) {
      return resolveFeedMediaDisplayUrls(embedded);
    }
    return { previewUri: undefined, fullUri: undefined };
  }

  if (post.contentType === "image") {
    const fullUri = resolveMediaDisplayUrl(post.mediaURL);
    const thumb = post.thumbURL?.trim();
    const previewUri = thumb ? resolveMediaDisplayUrl(thumb) : fullUri;
    return { previewUri, fullUri };
  }

  if (isVideoPost(post)) {
    const previewUri = resolveVideoPosterUrl(post);
    return { previewUri, fullUri: previewUri };
  }

  return { previewUri: undefined, fullUri: undefined };
}
