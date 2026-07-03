import { router } from "expo-router";
import { closeFlow } from "@/features/feed-v2/renderers/flow/FlowNavigator";

export type AuthorProfileSnapshot = {
  displayName?: string;
  photoURL?: string;
};

/** Clears Flow session + reels navigation before opening a profile screen. */
export function clearReelsNavigationForProfileVisit(): void {
  closeFlow();
}

export function navigateToAuthorProfile(
  authorId: string,
  currentUserId: string | undefined,
  snapshot?: AuthorProfileSnapshot
) {
  if (!authorId) return;

  clearReelsNavigationForProfileVisit();

  if (currentUserId && authorId === currentUserId) {
    router.push("/(tabs)/profile");
    return;
  }

  router.push({
    pathname: "/(tabs)/user/[userId]",
    params: {
      userId: authorId,
      displayName: snapshot?.displayName?.trim() ?? "",
      photoURL: snapshot?.photoURL?.trim() ?? "",
    },
  });
}
