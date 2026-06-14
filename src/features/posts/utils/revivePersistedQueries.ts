import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { AppNotification } from "@/features/notifications/types";
import type { FeedPageResult } from "../api/fetchFeedPage";
import { normalizeDate } from "@/lib/normalizeDate";
import { revivePost } from "./revivePost";

const FEED_QUERY_ROOTS = new Set(["feed", "profilePosts", "savedPosts"]);

function reviveFeedPage(page: FeedPageResult | null | undefined): FeedPageResult {
  if (!page || !Array.isArray(page.posts)) {
    return { posts: [], cursor: null, hasMore: false };
  }

  return {
    ...page,
    posts: page.posts.map(revivePost),
  };
}

function reviveFeedQueryData(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  if ("pages" in data && Array.isArray((data as InfiniteData<FeedPageResult>).pages)) {
    const infinite = data as InfiniteData<FeedPageResult>;
    return {
      ...infinite,
      pages: infinite.pages.map((page) => reviveFeedPage(page)),
    };
  }

  if ("posts" in data) {
    return reviveFeedPage(data as FeedPageResult);
  }

  return data;
}

function reviveNotification(notification: AppNotification): AppNotification {
  return {
    ...notification,
    createdAt: normalizeDate(notification.createdAt),
  };
}

/** Fix Date fields after React Query rehydrates JSON from AsyncStorage. */
export function revivePersistedQueries(queryClient: QueryClient): void {
  for (const query of queryClient.getQueryCache().getAll()) {
    const root = query.queryKey[0];
    if (typeof root !== "string") {
      continue;
    }

    if (root === "notifications") {
      queryClient.setQueryData(query.queryKey, (old: unknown) => {
        if (!Array.isArray(old)) {
          return old;
        }
        return old.map((item) => reviveNotification(item as AppNotification));
      });
      continue;
    }

    if (FEED_QUERY_ROOTS.has(root)) {
      queryClient.setQueryData(query.queryKey, (old: unknown) =>
        reviveFeedQueryData(old)
      );
    }
  }
}
