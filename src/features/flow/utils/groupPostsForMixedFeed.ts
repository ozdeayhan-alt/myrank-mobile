import type { Post } from "@/features/posts/types";
import {
  isFlowPost,
  isVideoPost,
} from "@/features/posts/utils/filterPostsByContentType";
import type { FeedListItem } from "@/features/posts/components/FeedFlashList";

export type FlowGridChunk = {
  kind: "flow_grid";
  key: string;
  posts: Post[];
};

export type MixedFeedPostItem = {
  kind: "post";
  key: string;
  post: Post;
};

export type MixedFeedItem = MixedFeedPostItem | FlowGridChunk;

function chunkFlowBatch(batch: Post[]): Post[][] {
  const chunks: Post[][] = [];
  let index = 0;

  while (index < batch.length) {
    const remaining = batch.length - index;
    let size = 2;
    if (remaining >= 4) {
      size = 4;
    } else if (remaining === 1) {
      size = 1;
    } else if (remaining === 3) {
      size = 2;
    } else {
      size = remaining;
    }

    chunks.push(batch.slice(index, index + size));
    index += size;
  }

  return chunks;
}

/** Groups chronological posts; consecutive Flow items become 2- or 4-tile grid rows. */
export function groupPostsForMixedFeed(posts: Post[]): MixedFeedItem[] {
  const items: MixedFeedItem[] = [];
  let index = 0;

  while (index < posts.length) {
    const post = posts[index];

    if (isVideoPost(post)) {
      index += 1;
      continue;
    }

    if (!isFlowPost(post)) {
      items.push({ kind: "post", key: post.id, post });
      index += 1;
      continue;
    }

    const flowBatch: Post[] = [];
    while (index < posts.length && isFlowPost(posts[index])) {
      flowBatch.push(posts[index]);
      index += 1;
    }

    for (const chunk of chunkFlowBatch(flowBatch)) {
      items.push({
        kind: "flow_grid",
        key: chunk.map((entry) => entry.id).join(":"),
        posts: chunk,
      });
    }
  }

  return items;
}

export function mapPostsToLegacyFeedItems(posts: Post[]): FeedListItem[] {
  return groupPostsForMixedFeed(posts).map((item) => {
    if (item.kind === "flow_grid") {
      return {
        kind: "flow_grid",
        key: item.key,
        posts: item.posts,
      };
    }

    return {
      kind: "post",
      key: item.key,
      post: item.post,
    };
  });
}

export function collectPostIdsFromMixedFeedItems(
  items: Array<
    | { kind: "post"; post: Post }
    | { kind: "flow_grid"; posts: Post[] }
    | { kind: string }
  >
): string[] {
  const ids: string[] = [];

  for (const item of items) {
    if (item.kind === "post" && "post" in item) {
      ids.push(item.post.id);
      continue;
    }

    if (item.kind === "flow_grid" && "posts" in item) {
      for (const post of item.posts) {
        ids.push(post.id);
      }
    }
  }

  return ids;
}
