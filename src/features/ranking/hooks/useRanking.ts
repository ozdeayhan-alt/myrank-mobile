import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/features/auth";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { sendPostInteractionSafe } from "@/features/ranking/api/sendPostInteraction";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import type { InteractionType } from "../constants";
import type { InteractionRequest, InteractionResponse } from "../types";

export function useRanking() {
  const { user } = useAuth();
  const setAuthorTotalScore = useProfileStore((s) => s.setTotalScore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInteraction = useCallback(
    async (request: InteractionRequest): Promise<InteractionResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await sendPostInteractionSafe(request);
        if (!result) return null;

        if (user?.uid && result.authorId === user.uid) {
          setAuthorTotalScore(result.authorTotalScore);
        }

        return result;
      } catch (err) {
        const message = getUserFacingErrorMessage(err);
        setError(message);
        Alert.alert("Etkileşim gönderilemedi", message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, setAuthorTotalScore]
  );

  const like = useCallback(
    (postId: string) => sendInteraction({ postId, type: "like" }),
    [sendInteraction]
  );

  const dislike = useCallback(
    (postId: string) => sendInteraction({ postId, type: "dislike" }),
    [sendInteraction]
  );

  const share = useCallback(
    (postId: string) => sendInteraction({ postId, type: "share" }),
    [sendInteraction]
  );

  const save = useCallback(
    (postId: string) => sendInteraction({ postId, type: "save" }),
    [sendInteraction]
  );

  const comment = useCallback(
    (postId: string, commentText: string) =>
      sendInteraction({ postId, type: "comment", commentText }),
    [sendInteraction]
  );

  return {
    sendInteraction,
    like,
    dislike,
    share,
    save,
    comment,
    loading,
    error,
  };
}

export type { InteractionType };
