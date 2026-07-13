import type { Post } from "@/features/posts/types";
import { resolvePostContentType } from "@/features/posts/utils/filterPostsByContentType";
import { isRepostPost } from "@/features/posts/utils/repostUtils";
import { groupPostsForMixedFeed } from "@/features/flow/utils/groupPostsForMixedFeed";
import type { FeedListItemKind, FeedV2ListItem, PostFeedListItemKind } from "./FeedEngine.types";

export function resolveFeedListItemKind(post: Post): PostFeedListItemKind {
  if (isRepostPost(post)) {
    return "repost";
  }

  const contentType = resolvePostContentType(post);
  if (contentType === "image") {
    return "glow";
  }

  return "whisp";
}

export function mapPostsToFeedItems(posts: Post[]): FeedV2ListItem[] {
  return groupPostsForMixedFeed(posts).map((item) => {
    if (item.kind === "flow_grid") {
      return {
        kind: "flow_grid",
        key: item.key,
        posts: item.posts,
      };
    }

    return {
      kind: resolveFeedListItemKind(item.post),
      key: item.key,
      post: item.post,
    };
  });
}
