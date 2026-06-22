import { resolveEmbeddedOriginalPost } from "./repostUtils";
import type { Post } from "../types";

export function isVideoPost(post: Post): boolean {
  return post.contentType === "video" && Boolean(post.mediaURL?.trim());
}

export function filterVideoPosts(posts: Post[]): Post[] {
  return posts.filter(isVideoPost);
}

export function indexOfVideoPost(videoPosts: Post[], postId: string): number {
  return videoPosts.findIndex((post) => post.id === postId);
}

/** Tıklanan video playlist'te yoksa (repost vb.) başa ekler. */
export function ensureVideoInPlaylist(
  postId: string,
  playlist: Post[],
  anchorPost?: Post | null
): Post[] {
  if (playlist.some((post) => post.id === postId)) {
    return playlist;
  }

  if (anchorPost?.id === postId && isVideoPost(anchorPost)) {
    return [anchorPost, ...playlist];
  }

  return playlist;
}

export function findVideoPostForOpen(posts: Post[], postId: string): Post | undefined {
  for (const post of posts) {
    if (post.id === postId && isVideoPost(post)) {
      return post;
    }

    const embedded = resolveEmbeddedOriginalPost(post);
    if (embedded?.id === postId && isVideoPost(embedded)) {
      return embedded;
    }
  }

  return undefined;
}
