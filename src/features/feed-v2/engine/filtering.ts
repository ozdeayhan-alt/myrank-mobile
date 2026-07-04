import type { Post } from "@/features/posts/types";
import { resolvePostContentType } from "@/features/posts/utils/filterPostsByContentType";
import { isRepostPost } from "@/features/posts/utils/repostUtils";
import type { FeedListItemKind, FeedV2ListItem } from "./FeedEngine.types";

export function resolveFeedListItemKind(post: Post): FeedListItemKind {
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
  return posts.map((post) => ({
    kind: resolveFeedListItemKind(post),
    key: post.id,
    post,
  }));
}
