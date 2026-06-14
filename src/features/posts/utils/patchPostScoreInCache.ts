import type { InfiniteData } from "@tanstack/react-query";
import type { Post } from "../types";
import type { FeedPageResult } from "../api/fetchFeedPage";

export function patchPostScoreInPages(
  data: InfiniteData<FeedPageResult> | undefined,
  postId: string,
  postScore: number
): InfiniteData<FeedPageResult> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.map((p) =>
        p.id === postId ? { ...p, postScore } : p
      ),
    })),
  };
}

export function patchPostScoreInList(
  posts: Post[] | undefined,
  postId: string,
  postScore: number
): Post[] | undefined {
  if (!posts) return posts;
  return posts.map((p) => (p.id === postId ? { ...p, postScore } : p));
}
