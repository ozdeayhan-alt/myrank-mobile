import type { Post } from "@/features/posts/types";
import {
  filterPostsByContentType,
  resolvePostContentType,
  type HomeContentFilter,
} from "@/features/posts/utils/filterPostsByContentType";
import { isRepostPost } from "@/features/posts/utils/repostUtils";
import { isVideoPost } from "@/features/posts/utils/videoPosts";
import type { FeedListItemKind, FeedV2ListItem } from "./FeedEngine.types";

export function resolveFeedListItemKind(post: Post): FeedListItemKind {
  if (isRepostPost(post)) {
    return "repost";
  }

  const contentType = resolvePostContentType(post);
  if (contentType === "tweet") {
    return "whisp";
  }
  if (contentType === "image") {
    return "glow";
  }
  if (isVideoPost(post)) {
    return "flow-teaser";
  }

  return "whisp";
}

export function mapPostsToFeedItems(
  posts: Post[],
  contentFilter: HomeContentFilter | null
): FeedV2ListItem[] {
  const filtered = filterPostsByContentType(posts, contentFilter);

  return filtered.map((post) => ({
    kind: resolveFeedListItemKind(post),
    key: post.id,
    post,
  }));
}
