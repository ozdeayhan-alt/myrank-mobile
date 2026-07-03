import type { Post, PostContentType } from "../types";

export type HomeContentFilter = "tweet" | "image";

export function resolvePostContentType(post: Post): PostContentType {
  if (post.contentType === "repost" && post.originalSnapshot?.contentType) {
    return post.originalSnapshot.contentType;
  }

  return post.contentType ?? "tweet";
}

export function isVideoPost(post: Post): boolean {
  return resolvePostContentType(post) === "video";
}

export function filterPostsByContentType(
  posts: Post[],
  filter: HomeContentFilter | null
): Post[] {
  const withoutVideo = posts.filter((post) => !isVideoPost(post));

  if (!filter) {
    return withoutVideo;
  }

  return withoutVideo.filter((post) => resolvePostContentType(post) === filter);
}
