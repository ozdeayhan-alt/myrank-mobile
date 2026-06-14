import { useCallback } from "react";
import { triggerLikeHaptic } from "@/lib/likeFeedback";

/** 👍 butonu: yalnızca beğenirken haptic; kaldırırken sessiz */
export function useLikePress(liked: boolean, onLike: () => void) {
  return useCallback(() => {
    if (!liked) {
      triggerLikeHaptic();
    }
    onLike();
  }, [liked, onLike]);
}
