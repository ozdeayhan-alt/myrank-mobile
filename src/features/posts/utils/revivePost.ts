import { normalizePost } from "./normalizePost";
import type { Post } from "../types";

export function revivePost(post: Post): Post {
  return normalizePost(post);
}
