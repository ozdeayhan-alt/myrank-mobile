import { router } from "expo-router";
import { useReelsActiveIndexStore } from "@/features/posts/store/useReelsActiveIndexStore";
import { useReelsNavigationStore } from "@/features/posts/store/useReelsNavigationStore";

export type AuthorProfileSnapshot = {
  displayName?: string;
  photoURL?: string;
};

export function clearReelsNavigationForProfileVisit(): void {
  useReelsNavigationStore.getState().clearNavigation();
  useReelsActiveIndexStore.getState().resetActiveIndex();
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
