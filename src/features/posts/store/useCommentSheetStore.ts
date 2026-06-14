import { create } from "zustand";
import type { InteractionResponse } from "@/features/ranking/types";

type CommentSheetStore = {
  postId: string | null;
  onSuccess: ((result: InteractionResponse) => void) | null;
  open: (postId: string, onSuccess?: (result: InteractionResponse) => void) => void;
  close: () => void;
};

export const useCommentSheetStore = create<CommentSheetStore>((set) => ({
  postId: null,
  onSuccess: null,
  open: (postId, onSuccess) => set({ postId, onSuccess: onSuccess ?? null }),
  close: () => set({ postId: null, onSuccess: null }),
}));
