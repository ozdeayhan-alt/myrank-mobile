import { resolveEmbeddedOriginalPost } from "./repostUtils";
import type { Post } from "../types";
import { postHasReelVideo } from "./resolveReelVideoSource";

export function isVideoPost(post: Post): boolean {
  return post.contentType === "video" && postHasReelVideo(post);
}

export function filterVideoPosts(posts: Post[]): Post[] {
  return posts.filter(isVideoPost);
}

/** Feed/profil playlist — direkt videolar + repost içindeki videolar. */
export function collectVideoPostsForPlaylist(posts: Post[]): Post[] {
  const result: Post[] = [];
  const seen = new Set<string>();

  for (const post of posts) {
    if (isVideoPost(post)) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        result.push(post);
      }
      continue;
    }

    const embedded = resolveEmbeddedOriginalPost(post);
    if (embedded && isVideoPost(embedded) && !seen.has(embedded.id)) {
      seen.add(embedded.id);
      result.push(embedded);
    }
  }

  return result;
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
