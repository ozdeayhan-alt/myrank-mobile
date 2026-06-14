import { router } from "expo-router";

export type AuthorProfileSnapshot = {
  displayName?: string;
  photoURL?: string;
};

export function navigateToAuthorProfile(
  authorId: string,
  currentUserId: string | undefined,
  snapshot?: AuthorProfileSnapshot
) {
  if (!authorId) return;

  if (currentUserId && authorId === currentUserId) {
    router.push("/(tabs)/profile");
    return;
  }

  router.push({
    pathname: "/user/[userId]",
    params: {
      userId: authorId,
      displayName: snapshot?.displayName?.trim() ?? "",
      photoURL: snapshot?.photoURL?.trim() ?? "",
    },
  });
}
