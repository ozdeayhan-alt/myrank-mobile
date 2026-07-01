import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import {
  buildSegmentKey,
  isMetadataComplete,
  type UserMetadata,
} from "@/features/profile/types";
import type { Post } from "../types";
import { revivePost } from "../utils/revivePost";
import type { EngagementStatus } from "@/features/ranking/types";
import { markEngagementsFromFeed } from "@/features/ranking/engagementHydration";
import { useEngagementStore } from "@/features/ranking/store/useEngagementStore";

export type FeedPageResult = {
  posts: Post[];
  cursor: string | null;
  hasMore: boolean;
  engagements?: Record<string, EngagementStatus>;
};

type FeedApiPost = Omit<Post, "createdAt"> & {
  createdAt?: string;
};

type FeedApiResponse = {
  ok: boolean;
  posts: FeedApiPost[];
  cursor: string | null;
  hasMore: boolean;
  engagements?: Record<string, EngagementStatus>;
  error?: string;
};

export function applyFeedPageEngagements(page: FeedPageResult): void {
  if (page.engagements && Object.keys(page.engagements).length > 0) {
    useEngagementStore.getState().mergeBatch(page.engagements);
    markEngagementsFromFeed(Object.keys(page.engagements));
  }
}

function mapApiPost(post: FeedApiPost): Post {
  return revivePost({
    ...post,
    createdAt: post.createdAt ? new Date(post.createdAt) : undefined,
  });
}

async function fetchFeedEndpoint(
  path: string,
  params: Record<string, string | undefined>
): Promise<FeedPageResult> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      search.set(key, value);
    }
  }

  const query = search.toString();
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/feed/${path}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as FeedApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Feed request failed");
  }

  const page: FeedPageResult = {
    posts: (data.posts ?? []).map(mapApiPost),
    cursor: data.cursor ?? null,
    hasMore: Boolean(data.hasMore),
    engagements: data.engagements,
  };

  applyFeedPageEngagements(page);
  return page;
}

export function fetchRecentFeedPage(
  cursor: string | null = null,
  limit = 15
): Promise<FeedPageResult> {
  return fetchFeedEndpoint("recent", {
    cursor: cursor ?? undefined,
    limit: String(limit),
  });
}

export function fetchExploreFeedPage(
  filters: UserMetadata | null,
  cursor: string | null = null,
  limit = 15
): Promise<FeedPageResult> {
  const useSegmentKey = filters != null && isMetadataComplete(filters);
  const params: Record<string, string | undefined> = {
    cursor: cursor ?? undefined,
    limit: String(limit),
  };

  if (useSegmentKey && filters) {
    params.segmentKey = buildSegmentKey(filters);
  } else if (filters) {
    params.country = filters.country || undefined;
    params.city = filters.city || undefined;
    params.gender = filters.gender || undefined;
    params.age =
      filters.age != null && filters.age > 0
        ? String(filters.age)
        : undefined;
    params.profession = filters.profession || undefined;
    params.maritalStatus = filters.maritalStatus || undefined;
  }

  return fetchFeedEndpoint("explore", params);
}

export function fetchFollowingFeedPage(
  cursor: string | null = null,
  limit = 15
): Promise<FeedPageResult> {
  return fetchFeedEndpoint("following", {
    cursor: cursor ?? undefined,
    limit: String(limit),
  });
}

export function fetchAuthorFeedPage(
  authorId: string,
  cursor: string | null = null,
  limit = 15
): Promise<FeedPageResult> {
  return fetchFeedEndpoint(`author/${encodeURIComponent(authorId.trim())}`, {
    cursor: cursor ?? undefined,
    limit: String(limit),
  });
}

export function fetchHashtagFeedPage(
  tag: string,
  cursor: string | null = null,
  limit = 15
): Promise<FeedPageResult> {
  const normalized = tag.trim().replace(/^#/, "").toLowerCase();
  return fetchFeedEndpoint(`hashtag/${encodeURIComponent(normalized)}`, {
    cursor: cursor ?? undefined,
    limit: String(limit),
  });
}

export function fetchSavedFeedPage(
  cursor: string | null = null,
  limit = 30
): Promise<FeedPageResult> {
  return fetchFeedEndpoint("saved", {
    cursor: cursor ?? undefined,
    limit: String(limit),
  });
}
