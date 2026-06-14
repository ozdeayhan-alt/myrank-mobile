import { FEED_PAGE_SIZE } from "../constants";
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
  pageSize = FEED_PAGE_SIZE
): Promise<AuthorPostsPage> {
  const page = await fetchAuthorFeedPage(authorId, cursor, pageSize);
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
  const page = await fetchPostsByAuthorPage(authorId, null, max);
  return page.posts;
}
