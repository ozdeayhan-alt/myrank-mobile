import type { Post, PostContentType } from "../types";

export type HomeContentFilter = "tweet" | "image" | "video";

export function resolvePostContentType(post: Post): PostContentType {
  if (post.contentType === "repost" && post.originalSnapshot?.contentType) {
    return post.originalSnapshot.contentType;
  }

  return post.contentType ?? "tweet";
}

export function filterPostsByContentType(
  posts: Post[],
  filter: HomeContentFilter | null
): Post[] {
  if (!filter || filter === "video") {
    return posts;
  }

  return posts.filter((post) => resolvePostContentType(post) === filter);
}
