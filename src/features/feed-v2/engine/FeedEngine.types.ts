import type { Post } from "@/features/posts/types";
import type { PostCounts } from "@/features/ranking/types";

export type FeedListItemKind = "whisp" | "glow" | "repost" | "duel";

export type FeedV2ListItem =
  | {
      kind: "whisp" | "glow" | "repost";
      key: string;
      post: Post;
    }
  | {
      kind: "duel";
      key: string;
    };

export type FeedEngineData = {
  posts: Post[];
  items: FeedV2ListItem[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
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
  items?: FeedV2ListItem[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  refresh: () => void | Promise<void>;
  fetchNextPage: () => void;
  updatePostScore: FeedEngineActions["updatePostScore"];
};
