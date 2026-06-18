import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { patchPublicProfileTotalScore } from "@/features/profile/lib/patchPublicProfileTotalScore";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { fetchPostVoteBatch } from "@/features/ranking/api/fetchPostVoteBatch";
import { sendPostInteractionSafe } from "@/features/ranking/api/sendPostInteraction";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import type { InteractionType } from "../constants";
import type { InteractionRequest, InteractionResponse } from "../types";

export function useRanking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  const votePost = useCallback(
    async (postId: string, delta: 1 | -1) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPostVoteBatch(postId, delta);
        patchPublicProfileTotalScore(
          queryClient,
          result.authorId,
          result.authorTotalScore
        );
        if (user?.uid && result.authorId === user.uid) {
          setAuthorTotalScore(result.authorTotalScore);
        }
        return result;
      } catch (err) {
        const message = getUserFacingErrorMessage(err);
        setError(message);
        Alert.alert("Gönderi oyu gönderilemedi", message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, queryClient, setAuthorTotalScore]
  );

  const like = useCallback(
    (postId: string) => votePost(postId, 1),
    [votePost]
  );

  const dislike = useCallback(
    (postId: string) => votePost(postId, -1),
    [votePost]
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
