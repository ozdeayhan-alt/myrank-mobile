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

  if (post.contentType === "flow") {
    const thumb = (post.thumbnailUrl ?? post.posterURL)?.trim();
    if (!thumb) {
      return { previewUri: undefined, fullUri: undefined };
    }
    // YouTube CDN URLs — do not run through Firebase media proxy.
    return { previewUri: thumb, fullUri: undefined };
  }

  return { previewUri: undefined, fullUri: undefined };
}
