import { DEFAULT_DISPLAY_NAME } from "@/features/profile/types";
import type { PostComment } from "../types";

export function resolveCommentAuthorDisplayName(comment: PostComment): string {
  const name = comment.actorDisplayName?.trim();
  if (name) return name;
  if (comment.actorId) {
    return `Kullanıcı ${comment.actorId.slice(0, 6)}`;
  }
  return DEFAULT_DISPLAY_NAME;
}

export function resolveCommentAuthorPhotoURL(comment: PostComment): string {
  return comment.actorPhotoURL?.trim() ?? "";
}

export function resolveCommentAuthorInitial(comment: PostComment): string {
  const name = resolveCommentAuthorDisplayName(comment);
  return name[0]?.toUpperCase() ?? "?";
}
