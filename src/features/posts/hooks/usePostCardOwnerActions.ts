import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import type { ReportReason } from "@/features/blocks/api/reportContent";
import { reportContent } from "@/features/blocks/api/reportContent";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { showReportSubmittedAlert } from "@/features/blocks/utils/reportFeedback";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { deletePost } from "../api/deletePost";
import { updatePostContent } from "../api/updatePostContent";
import { TWEET_MAX_LENGTH } from "../constants";
import {
  getWhispMaxLengthMessage,
  getWhispTextRequiredMessage,
} from "../constants/contentTypeLabels";
import { useFeedRefreshStore } from "../store/useFeedRefreshStore";
import type { Post } from "../types";

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
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
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
      setDeleteConfirmOpen(false);
      onPostDeleted?.(post.id);
    } catch (error) {
      Alert.alert("Silinemedi", getUserFacingErrorMessage(error));
    } finally {
      setOwnerActionLoading(false);
    }
  }, [post.id, bumpFeed, onPostDeleted, setTotalScore, currentUserId]);

  const handleReportReason = useCallback(
    (reason: ReportReason) => {
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
    },
    [post.authorId, post.id]
  );

  const handleOwnerMenuPress = useCallback(() => {
    setOwnerMenuOpen(true);
  }, []);

  const handleMoreMenuPress = useCallback(() => {
    setMoreMenuOpen(true);
  }, []);

  const handleEditFromMenu = useCallback(() => {
    setEditOpen(true);
  }, []);

  const handleRequestDelete = useCallback(() => {
    setDeleteConfirmOpen(true);
  }, []);

  const handleOpenReportMenu = useCallback(() => {
    setReportMenuOpen(true);
  }, []);

  const handleEditSave = useCallback(
    async (nextContent: string) => {
      const trimmed = nextContent.trim();
      const contentType = post.contentType ?? "tweet";

      if (contentType === "tweet" && !trimmed) {
        Alert.alert("Eksik metin", getWhispTextRequiredMessage());
        return;
      }

      if (contentType === "tweet" && trimmed.length > TWEET_MAX_LENGTH) {
        Alert.alert(
          "Çok uzun",
          getWhispMaxLengthMessage(TWEET_MAX_LENGTH)
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
    ownerMenuOpen,
    moreMenuOpen,
    deleteConfirmOpen,
    reportMenuOpen,
    setOwnerMenuOpen,
    setMoreMenuOpen,
    setDeleteConfirmOpen,
    setReportMenuOpen,
    handleOwnerMenuPress,
    handleMoreMenuPress,
    handleEditFromMenu,
    handleRequestDelete,
    handleOpenReportMenu,
    handleConfirmDelete: handleDelete,
    handleReportReason,
    handleEditSave,
  };
}
