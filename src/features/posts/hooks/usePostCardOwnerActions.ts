import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { reportContent } from "@/features/blocks/api/reportContent";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { showReportReasonPicker } from "@/features/blocks/utils/showReportReasonPicker";
import { showReportSubmittedAlert } from "@/features/blocks/utils/reportFeedback";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { deletePost } from "../api/deletePost";
import { updatePostContent } from "../api/updatePostContent";
import { TWEET_MAX_LENGTH } from "../constants";
import { useFeedRefreshStore } from "../store/useFeedRefreshStore";
import type { Post } from "../types";
import { isRepostPost } from "../utils/repostUtils";

type UsePostCardOwnerActionsOptions = {
  post: Post;
  currentUserId?: string | null;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
};

export function usePostCardOwnerActions({
  post,
  currentUserId = null,
  onPostDeleted,
  onPostContentUpdated,
}: UsePostCardOwnerActionsOptions) {
  const setTotalScore = useProfileStore((s) => s.setTotalScore);
  const bumpFeed = useFeedRefreshStore((s) => s.bump);
  const [contentOverride, setContentOverride] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [ownerActionLoading, setOwnerActionLoading] = useState(false);

  const displayPost = useMemo(
    () =>
      contentOverride !== null ? { ...post, content: contentOverride } : post,
    [post, contentOverride]
  );

  const handleDelete = useCallback(async () => {
    setOwnerActionLoading(true);
    try {
      const result = await deletePost(post.id);
      if (
        currentUserId &&
        result.authorId === currentUserId &&
        typeof result.authorTotalScore === "number"
      ) {
        setTotalScore(result.authorTotalScore);
      }
      bumpFeed();
      onPostDeleted?.(post.id);
    } catch (error) {
      Alert.alert("Silinemedi", getUserFacingErrorMessage(error));
    } finally {
      setOwnerActionLoading(false);
    }
  }, [post.id, bumpFeed, onPostDeleted, setTotalScore, currentUserId]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      "Gönderiyi sil",
      "Bu işlem geri alınamaz. Gönderi ve medyası kalıcı olarak silinir.",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => void handleDelete() },
      ]
    );
  }, [handleDelete]);

  const handleReportPost = useCallback(() => {
    showReportReasonPicker((reason) => {
      void (async () => {
        try {
          await reportContent({
            targetPostId: post.id,
            targetUserId: post.authorId,
            reason,
          });
          showReportSubmittedAlert();
        } catch (error) {
          Alert.alert("Hata", getUserFacingErrorMessage(error));
        }
      })();
    });
  }, [post.authorId, post.id]);

  const handleMoreMenuPress = useCallback(() => {
    Alert.alert("Gönderi", undefined, [
      { text: "Şikayet et", onPress: handleReportPost },
      { text: "İptal", style: "cancel" },
    ]);
  }, [handleReportPost]);

  const handleOwnerMenuPress = useCallback(() => {
    if (isRepostPost(post)) {
      Alert.alert("Gönderi", undefined, [
        { text: "Sil", style: "destructive", onPress: confirmDelete },
        { text: "İptal", style: "cancel" },
      ]);
      return;
    }

    Alert.alert("Gönderi", undefined, [
      { text: "Metni düzenle", onPress: () => setEditOpen(true) },
      { text: "Sil", style: "destructive", onPress: confirmDelete },
      { text: "İptal", style: "cancel" },
    ]);
  }, [confirmDelete, post]);

  const handleEditSave = useCallback(
    async (nextContent: string) => {
      const trimmed = nextContent.trim();
      const contentType = post.contentType ?? "tweet";

      if (contentType === "tweet" && !trimmed) {
        Alert.alert("Eksik metin", "Tweet metni boş olamaz.");
        return;
      }

      if (contentType === "tweet" && trimmed.length > TWEET_MAX_LENGTH) {
        Alert.alert(
          "Çok uzun",
          `Tweet en fazla ${TWEET_MAX_LENGTH} karakter olabilir.`
        );
        return;
      }

      setOwnerActionLoading(true);
      try {
        const saved = await updatePostContent(post.id, trimmed);
        setContentOverride(saved);
        bumpFeed();
        onPostContentUpdated?.(post.id, saved);
        setEditOpen(false);
      } catch (error) {
        Alert.alert("Kaydedilemedi", getUserFacingErrorMessage(error));
      } finally {
        setOwnerActionLoading(false);
      }
    },
    [post.id, post.contentType, bumpFeed, onPostContentUpdated]
  );

  return {
    displayPost,
    editOpen,
    setEditOpen,
    ownerActionLoading,
    handleOwnerMenuPress,
    handleMoreMenuPress,
    handleEditSave,
  };
}
