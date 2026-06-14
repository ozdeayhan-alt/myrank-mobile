import { getPublicProfile } from "@/features/profile/api/getPublicProfile";
import type { PostComment } from "../types";

export async function enrichCommentAuthors(
  comments: PostComment[]
): Promise<PostComment[]> {
  if (comments.length === 0) return comments;

  const actorIds = [
    ...new Set(
      comments
        .filter((comment) => comment.actorId && !comment.actorDisplayName?.trim())
        .map((comment) => comment.actorId)
    ),
  ];

  if (actorIds.length === 0) return comments;

  const profiles = await Promise.all(
    actorIds.map(async (actorId) => {
      try {
        const profile = await getPublicProfile(actorId);
        return [actorId, profile] as const;
      } catch {
        return [actorId, null] as const;
      }
    })
  );

  const profileByActorId = new Map(
    profiles
      .filter((entry): entry is [string, NonNullable<(typeof profiles)[number][1]>] =>
        Boolean(entry[1])
      )
      .map(([actorId, profile]) => [actorId, profile])
  );

  return comments.map((comment) => {
    if (comment.actorDisplayName?.trim()) return comment;

    const profile = profileByActorId.get(comment.actorId);
    if (!profile) return comment;

    return {
      ...comment,
      actorDisplayName: profile.displayName,
      actorPhotoURL: profile.photoURL || comment.actorPhotoURL,
    };
  });
}
