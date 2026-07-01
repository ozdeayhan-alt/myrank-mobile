import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { invalidateServerFeedCache } from "../api/invalidateServerFeedCache";
import { createPost } from "../api/createPost";
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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

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

      useFeedRefreshStore.getState().bump();
      void invalidateServerFeedCache();

      setSuccessMessage("Gönderiniz paylaşıldı");
      onCreated?.();
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null;
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
