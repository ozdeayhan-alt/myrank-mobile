import {
  fetchSavedFeedPage,
  type FeedPageResult,
} from "@/features/posts/api/fetchFeedPage";

export type SavedPostsPage = FeedPageResult;

export async function fetchSavedPostsPage(
  cursor: string | null = null,
  pageSize = 30
): Promise<SavedPostsPage> {
  return fetchSavedFeedPage(cursor, pageSize);
}
