import type { Post } from "@/features/posts/types";

export function flattenFeedPages(
  data: { pages: { posts: Post[] }[] } | undefined
): Post[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.posts);
}
