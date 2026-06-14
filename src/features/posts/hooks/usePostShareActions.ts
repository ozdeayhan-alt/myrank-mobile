import { useCallback, useState } from "react";
import { Alert, Share } from "react-native";
import type { InteractionType } from "@/features/ranking/constants";
import type { InteractionResponse } from "@/features/ranking/types";
import type { Post } from "../types";

type SendInteraction = (payload: {
  postId: string;
  type: InteractionType;
  commentText?: string;
}) => Promise<InteractionResponse | null>;

type UsePostShareActionsOptions = {
  post: Post;
  sendInteraction: SendInteraction;
  applyResult: (result: InteractionResponse) => void;
  markShared: () => void;
  markSaved: () => void;
};

export function usePostShareActions({
  post,
  sendInteraction,
  applyResult,
  markShared,
  markSaved,
}: UsePostShareActionsOptions) {
  const [commentLoading, setCommentLoading] = useState(false);
  const [shareSaveLoading, setShareSaveLoading] = useState(false);

  const handleInteraction = useCallback(
    async (type: InteractionType, text?: string) => {
      if (type === "comment" && !text?.trim()) {
        Alert.alert("Eksik yorum", "Lütfen bir yorum yazın.");
        return null;
      }

      const payload =
        type === "comment"
          ? { postId: post.id, type, commentText: text ?? "" }
          : { postId: post.id, type };

      const result = await sendInteraction(payload);
      if (result) {
        applyResult(result);
      }
      return result;
    },
    [applyResult, post.id, sendInteraction]
  );

  const shareMessage =
    post.contentType === "repost"
      ? [
          post.repostCaption?.trim(),
          post.originalSnapshot?.content?.trim(),
        ]
          .filter(Boolean)
          .join("\n\n") || "MyRank gönderisi"
      : (post.content ?? "MyRank gönderisi");

  const handleExternalShare = useCallback(async () => {
    setShareSaveLoading(true);
    try {
      try {
        const shareResult = await Share.share({
          message: shareMessage,
          title: "MyRank",
        });
        if (shareResult.action === Share.dismissedAction) {
          return;
        }
      } catch {
        // ignore
      }
      const result = await handleInteraction("share");
      if (result) {
        markShared();
      }
    } finally {
      setShareSaveLoading(false);
    }
  }, [handleInteraction, markShared, shareMessage]);

  const handleShare = handleExternalShare;

  const handleSave = useCallback(async () => {
    setShareSaveLoading(true);
    try {
      const result = await handleInteraction("save");
      if (result) {
        markSaved();
      }
    } finally {
      setShareSaveLoading(false);
    }
  }, [handleInteraction, markSaved]);

  const submitComment = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        Alert.alert("Eksik yorum", "Lütfen bir yorum yazın.");
        return false;
      }

      setCommentLoading(true);
      try {
        const result = await sendInteraction({
          postId: post.id,
          type: "comment",
          commentText: trimmed,
        });

        if (result) {
          applyResult(result);
          return true;
        }
        return false;
      } finally {
        setCommentLoading(false);
      }
    },
    [applyResult, post.id, sendInteraction]
  );

  return {
    handleExternalShare,
    handleShare,
    handleSave,
    submitComment,
    commentLoading,
    shareSaveLoading,
  };
}
