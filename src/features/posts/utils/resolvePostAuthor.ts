import { DEFAULT_DISPLAY_NAME } from "@/features/profile/types";
import type { Post } from "../types";

export function resolvePostAuthorDisplayName(post: Post): string {
  const name = post.authorDisplayName?.trim();
  if (name) return name;
  if (post.authorId) {
    return `Kullanıcı ${post.authorId.slice(0, 6)}`;
  }
  return DEFAULT_DISPLAY_NAME;
}

export function resolvePostAuthorPhotoURL(post: Post): string {
  return post.authorPhotoURL?.trim() ?? "";
}

export function resolvePostAuthorInitial(post: Post): string {
  const name = resolvePostAuthorDisplayName(post);
  return name[0]?.toUpperCase() ?? "?";
}
