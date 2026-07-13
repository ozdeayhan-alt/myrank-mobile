import { Image } from "expo-image";
import {
  resolveMediaDisplayUrl,
} from "@/lib/media/resolveMediaDisplayUrl";
import type { Post } from "../types";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "./repostUtils";

function prefetchFlowThumbnail(post: Post): void {
  const uri = (post.thumbnailUrl ?? post.posterURL)?.trim();
  if (uri) {
    void Image.prefetch(uri, { cachePolicy: "memory-disk" });
  }
}

function prefetchSinglePostMedia(post: Post): void {
  if (post.contentType === "image") {
    const uri = resolveMediaDisplayUrl(post.mediaURL);
    if (uri) {
      void Image.prefetch(uri, { cachePolicy: "memory-disk" });
    }
    return;
  }

  if (post.contentType === "flow") {
    prefetchFlowThumbnail(post);
  }
}

export function prefetchPostMedia(post: Post): void {
  if (isRepostPost(post)) {
    const embedded = resolveEmbeddedOriginalPost(post);
    if (embedded) {
      prefetchSinglePostMedia(embedded);
    }
    return;
  }

  prefetchSinglePostMedia(post);
}

export function prefetchFeedPostsBatch(posts: Post[]): void {
  for (const post of posts) {
    prefetchPostMedia(post);
  }
}

function prefetchSinglePostImagesOnly(post: Post): void {
  const { previewUri, fullUri } = resolveFeedMediaDisplayUrls(post);

  if (previewUri) {
    void Image.prefetch(previewUri, { cachePolicy: "memory-disk" });
  }

  if (fullUri && fullUri !== previewUri) {
    void Image.prefetch(fullUri, { cachePolicy: "memory-disk" });
  }
}

/** Scroll sırasında — sadece görsel prefetch. */
export function prefetchFeedPostsImagesBatch(posts: Post[]): void {
  const seen = new Set<string>();

  for (const post of posts) {
    if (seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);

    if (isRepostPost(post)) {
      const embedded = resolveEmbeddedOriginalPost(post);
      if (embedded) {
        prefetchSinglePostImagesOnly(embedded);
      }
      continue;
    }

    prefetchSinglePostImagesOnly(post);
  }
}
