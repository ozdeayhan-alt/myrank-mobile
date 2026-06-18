import type { InfiniteData } from "@tanstack/react-query";
import type { PostCounts } from "@/features/ranking/types";
import type { Post } from "../types";
import type { FeedPageResult } from "../api/fetchFeedPage";

export type PostScoreUpdate = {
  postScore: number;
  counts?: PostCounts;
};

function applyPostScoreUpdate(post: Post, update: PostScoreUpdate): Post {
  if (!update.counts) {
    return { ...post, postScore: update.postScore };
  }

  return {
    ...post,
    postScore: update.postScore,
    likeCount: update.counts.likeCount,
    dislikeCount: update.counts.dislikeCount,
    shareCount: update.counts.shareCount,
    saveCount: update.counts.saveCount,
    commentCount: update.counts.commentCount,
  };
}

export function patchPostInPages<T extends { posts: Post[] }>(
  data: InfiniteData<T> | undefined,
  postId: string,
  update: PostScoreUpdate
): InfiniteData<T> | undefined {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.map((post) =>
        post.id === postId ? applyPostScoreUpdate(post, update) : post
      ),
    })),
  };
}

export function patchPostInList(
  posts: Post[] | undefined,
  postId: string,
  update: PostScoreUpdate
): Post[] | undefined {
  if (!posts) return posts;
  return posts.map((post) =>
    post.id === postId ? applyPostScoreUpdate(post, update) : post
  );
}

/** @deprecated Use patchPostInPages */
export function patchPostScoreInPages(
  data: InfiniteData<FeedPageResult> | undefined,
  postId: string,
  postScore: number
): InfiniteData<FeedPageResult> | undefined {
  return patchPostInPages(data, postId, { postScore });
}

/** @deprecated Use patchPostInList */
export function patchPostScoreInList(
  posts: Post[] | undefined,
  postId: string,
  postScore: number
): Post[] | undefined {
  return patchPostInList(posts, postId, { postScore });
}
