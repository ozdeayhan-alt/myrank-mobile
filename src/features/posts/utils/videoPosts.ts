import type { Post } from "../types";

export function isVideoPost(post: Post): boolean {
  return post.contentType === "video" && Boolean(post.mediaURL?.trim());
}

export function filterVideoPosts(posts: Post[]): Post[] {
  return posts.filter(isVideoPost);
}

export function indexOfVideoPost(
  videoPosts: Post[],
  postId: string
): number {
  const index = videoPosts.findIndex((p) => p.id === postId);
  return index >= 0 ? index : 0;
}
