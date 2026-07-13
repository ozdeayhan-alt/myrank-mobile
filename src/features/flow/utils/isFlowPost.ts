import type { Post } from "@/features/posts/types";
import { resolvePostContentType } from "@/features/posts/utils/filterPostsByContentType";

export function isFlowPost(post: Post): boolean {
  return resolvePostContentType(post) === "flow";
}
