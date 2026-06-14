import type { Post } from "../types";

export function isVideoPost(post: Post): boolean {
  return post.contentType === "video" && Boolean(post.mediaURL?.trim());
}

export function filterVideoPosts(posts: Post[]): Post[] {
  return posts.filter(isVideoPost);
}

export function mergeHomeFeedVideoPosts(
  recentPosts: Post[],
  topPosts: Post[]
): Post[] {
  const seen = new Set<string>();
  const merged: Post[] = [];

  for (const post of [...recentPosts, ...topPosts]) {
    if (!isVideoPost(post) || seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);
    merged.push(post);
  }

  return merged;
}

export function indexOfVideoPost(
  videoPosts: Post[],
  postId: string
): number {
  const index = videoPosts.findIndex((p) => p.id === postId);
  return index >= 0 ? index : 0;
}
