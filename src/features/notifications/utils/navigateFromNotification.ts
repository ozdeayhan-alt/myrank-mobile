import type { Router } from "expo-router";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import type { AppNotification } from "../types";

export function canNavigateFromNotification(
  notification: AppNotification
): boolean {
  const { type, payload, actorId } = notification;

  switch (type) {
    case "post_liked":
    case "post_commented":
    case "post_saved":
    case "post_mentioned":
      return Boolean(payload.postId?.trim());
    case "post_reposted":
      return Boolean(payload.repostId?.trim() || payload.postId?.trim());
    case "message_received":
      return Boolean(payload.conversationId?.trim());
    case "profile_votes":
    case "user_followed":
      return Boolean(actorId.trim());
    case "rank_passed":
      return true;
    default:
      return false;
  }
}

export function navigateFromNotification(
  notification: AppNotification,
  router: Router,
  currentUserId?: string
): void {
  if (!canNavigateFromNotification(notification)) {
    return;
  }

  const { type, payload, actorId, actorDisplayName } = notification;

  switch (type) {
    case "post_liked":
    case "post_commented":
    case "post_saved":
    case "post_mentioned": {
      const postId = payload.postId?.trim();
      if (postId) {
        router.push(`/post/${postId}`);
      }
      break;
    }
    case "post_reposted": {
      const postId = (payload.repostId ?? payload.postId)?.trim();
      if (postId) {
        router.push(`/post/${postId}`);
      }
      break;
    }
    case "message_received": {
      const conversationId = payload.conversationId?.trim();
      if (conversationId) {
        router.push({
          pathname: "/messages/[conversationId]",
          params: {
            conversationId,
            title: actorDisplayName.trim() || "Sohbet",
            photoURL: "",
          },
        });
      }
      break;
    }
    case "profile_votes":
    case "user_followed":
      navigateToAuthorProfile(actorId, currentUserId, {
        displayName: actorDisplayName,
      });
      break;
    case "rank_passed":
      router.push("/(tabs)/ranking");
      break;
    default:
      break;
  }
}
