import { useCallback } from "react";
import { useCommentSheetStore } from "../store/useCommentSheetStore";
import type { InteractionResponse } from "@/features/ranking/types";

export function useOpenCommentSheet() {
  const open = useCommentSheetStore((state) => state.open);

  return useCallback(
    (postId: string, onSuccess?: (result: InteractionResponse) => void) => {
      open(postId, onSuccess);
    },
    [open]
  );
}
