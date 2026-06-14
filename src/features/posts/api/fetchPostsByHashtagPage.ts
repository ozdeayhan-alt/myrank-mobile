import { FEED_PAGE_SIZE } from "../constants";
import type { Post } from "../types";
import { fetchHashtagFeedPage } from "./fetchFeedPage";
import { normalizeHashtag } from "../utils/parsePostContent";

export type HashtagPostsPage = {
  posts: Post[];
  cursor: string | null;
  hasMore: boolean;
};

export async function fetchPostsByHashtagPage(
  rawTag: string,
  cursor: string | null = null,
  pageSize = FEED_PAGE_SIZE
): Promise<HashtagPostsPage> {
  const tag = normalizeHashtag(rawTag);
  if (!tag) {
    return { posts: [], cursor: null, hasMore: false };
  }

  const page = await fetchHashtagFeedPage(tag, cursor, pageSize);
  return {
    posts: page.posts,
    cursor: page.cursor,
    hasMore: page.hasMore,
  };
}
