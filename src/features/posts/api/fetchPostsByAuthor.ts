import { resolveFeedPageLimit } from "@/features/feed/feedPagination";
import type { FeedApiContentType } from "@/features/feed/feedContentType";
import type { Post } from "../types";
import { fetchAuthorFeedPage } from "./fetchFeedPage";

export type AuthorPostsPage = {
  posts: Post[];
  cursor: string | null;
  hasMore: boolean;
};

export async function fetchPostsByAuthorPage(
  authorId: string,
  cursor: string | null,
  contentType: FeedApiContentType = "all",
  signal?: AbortSignal
): Promise<AuthorPostsPage> {
  const page = await fetchAuthorFeedPage(authorId, cursor, {
    limit: resolveFeedPageLimit(cursor),
    contentType,
    signal,
  });
  return {
    posts: page.posts,
    cursor: page.cursor,
    hasMore: page.hasMore,
  };
}

/** @deprecated Use fetchPostsByAuthorPage for pagination */
export async function fetchPostsByAuthor(
  authorId: string,
  max = 30
): Promise<Post[]> {
  const page = await fetchPostsByAuthorPage(authorId, null, "all");
  return page.posts.slice(0, max);
}
