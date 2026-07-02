import type { Post } from "@/features/posts/types";
import type { PostCounts } from "@/features/ranking/types";
import type { HomeContentFilter } from "@/features/posts/utils/filterPostsByContentType";

export type FeedListItemKind = "whisp" | "glow" | "flow-teaser" | "repost";

export type FeedV2ListItem = {
  kind: FeedListItemKind;
  key: string;
  post: Post;
};

export type FeedEngineData = {
  posts: Post[];
  videoPosts: Post[];
  items: FeedV2ListItem[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
};

export type FeedEngineActions = {
  refresh: () => void | Promise<void>;
  fetchNextPage: () => void;
  updatePostScore: (
    postId: string,
    postScore: number,
    counts?: PostCounts
  ) => void;
};

export type FeedEngineResult = FeedEngineData & FeedEngineActions;

export type FeedEngineInput = {
  posts: Post[];
  contentFilter: HomeContentFilter | null;
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isRefetching: boolean;
  refresh: () => void | Promise<void>;
  fetchNextPage: () => void;
  updatePostScore: FeedEngineActions["updatePostScore"];
};
