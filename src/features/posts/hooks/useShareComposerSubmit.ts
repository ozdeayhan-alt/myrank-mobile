import { useCallback } from "react";
import { Alert } from "react-native";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { recordError } from "@/lib/crashReporting";
import { invalidateServerFeedCache } from "../api/invalidateServerFeedCache";
import { notifyPostFanOut } from "../api/notifyPostFanOut";
import { createPost } from "../api/createPost";
import { notifyMentions } from "../api/notifyMentions";
import { uploadPostMedia } from "../api/uploadPostMedia";
import { useFeedRefreshStore } from "../store/useFeedRefreshStore";
import type { PostContentType } from "../types";

type UseShareComposerSubmitOptions = {
  userId: string | undefined;
  selected: PostContentType;
  content: string;
  mediaUri: string | null;
  mediaMimeType: string | null;
  canSubmit: boolean;
  onCreated?: () => void;
  onClose: () => void;
  setSubmitting: (value: boolean) => void;
  setPrepareMessage: (value: string | null) => void;
  setPrepareProgress: (value: number | null) => void;
  setSuccessMessage: (value: string | null) => void;
};

export function useShareComposerSubmit({
  userId,
  selected,
  content,
  mediaUri,
  mediaMimeType,
  canSubmit,
  onCreated,
  onClose,
  setSubmitting,
  setPrepareMessage,
  setPrepareProgress,
  setSuccessMessage,
}: UseShareComposerSubmitOptions) {
  return useCallback(async () => {
    if (!userId) {
      Alert.alert("Hata", "Oturum açık değil.");
      return;
    }

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setPrepareMessage(null);
    setPrepareProgress(null);
    setSuccessMessage(null);

    try {
      let mediaURL: string | undefined;
      let hlsURL: string | undefined;
      let posterURL: string | undefined;
      let mediaWidth: number | undefined;
      let mediaHeight: number | undefined;

      if (mediaUri && (selected === "image" || selected === "video")) {
        const uploaded = await uploadPostMedia(
          userId,
          mediaUri,
          selected,
          mediaMimeType,
          {
            onPrepareProgress: (message, progress) => {
              setPrepareMessage(message);
              setPrepareProgress(
                typeof progress === "number" ? progress : null
              );
            },
          }
        );
        mediaURL = uploaded.mediaURL;
        hlsURL = uploaded.hlsURL;
        posterURL = uploaded.posterURL;
        mediaWidth = uploaded.mediaWidth;
        mediaHeight = uploaded.mediaHeight;
      }

      const created = await createPost(userId, {
        contentType: selected,
        content: content.trim(),
        mediaURL,
        hlsURL,
        posterURL,
        mediaWidth,
        mediaHeight,
      });

      if (created.mentionUserIds.length > 0) {
        void notifyMentions(created.id, created.mentionUserIds).catch(() => {
          // non-blocking
        });
      }

      useFeedRefreshStore.getState().bump();
      void invalidateServerFeedCache();
      void notifyPostFanOut(created.id).catch((error) => {
        console.error("[createPost] fan-out failed:", error);
        recordError(error, "createPost:fanOut");
      });

      setSuccessMessage("Gönderiniz paylaşıldı");
      onCreated?.();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      Alert.alert("Paylaşım başarısız", getUserFacingErrorMessage(error));
    } finally {
      setSubmitting(false);
      setPrepareMessage(null);
      setPrepareProgress(null);
    }
  }, [
    canSubmit,
    content,
    mediaMimeType,
    mediaUri,
    onClose,
    onCreated,
    selected,
    setPrepareMessage,
    setPrepareProgress,
    setSubmitting,
    setSuccessMessage,
    userId,
  ]);
}
