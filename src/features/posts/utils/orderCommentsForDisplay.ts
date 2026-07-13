import type { PostComment } from "@/features/ranking/types";

export function orderCommentsForDisplay(comments: PostComment[]): PostComment[] {
  if (comments.length === 0) {
    return [];
  }

  const byParent = new Map<string | null, PostComment[]>();

  for (const comment of comments) {
    const key = comment.parentCommentId ?? null;
    const bucket = byParent.get(key);
    if (bucket) {
      bucket.push(comment);
    } else {
      byParent.set(key, [comment]);
    }
  }

  const sortAsc = (left: PostComment, right: PostComment) =>
    left.createdAt.localeCompare(right.createdAt);

  const roots = [...(byParent.get(null) ?? [])].sort(sortAsc);
  const ordered: PostComment[] = [];

  for (const root of roots) {
    ordered.push(root);
    const replies = [...(byParent.get(root.id) ?? [])].sort(sortAsc);
    ordered.push(...replies);
  }

  return ordered;
}
