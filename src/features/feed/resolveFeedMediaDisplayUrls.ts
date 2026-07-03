import type { Post } from "@/features/posts/types";
import {
  resolveMediaDisplayUrl,
} from "@/lib/media/resolveMediaDisplayUrl";
import { isRepostPost, resolveEmbeddedOriginalPost } from "@/features/posts/utils/repostUtils";

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

  return { previewUri: undefined, fullUri: undefined };
}
