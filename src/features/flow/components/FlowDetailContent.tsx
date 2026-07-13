import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/features/auth";
import { PostInteractionProvider } from "@/features/posts/context/PostInteractionContext";
import { EditPostTextModal } from "@/features/posts/components/EditPostTextModal";
import { PostCardOwnerSheets } from "@/features/posts/components/PostCardOwnerSheets";
import { PostShareModals } from "@/features/posts/components/PostShareModals";
import { fetchPostById } from "@/features/posts/api/fetchPostById";
import { usePostCardOwnerActions } from "@/features/posts/hooks/usePostCardOwnerActions";
import { useShareAndRepost } from "@/features/posts/hooks/useShareAndRepost";
import { useOpenCommentSheet } from "@/features/posts/hooks/useOpenCommentSheet";
import type { Post } from "@/features/posts/types";
import { isFlowPost } from "@/features/flow/utils/isFlowPost";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { useFlowViewerSessionStore } from "../store/useFlowViewerSessionStore";
import { useFlowFeedInfinite } from "../hooks/useFlowFeedInfinite";
import { useFlowDetailNavigation } from "../hooks/useFlowDetailNavigation";
import { FlowPlayerPool } from "./FlowPlayerPool";
import { FlowDetailOverlays } from "./FlowDetailOverlays";

/** Keep video inset from screen edges (contain + padding). */
const PLAYER_VERTICAL_INSET = 28;
const PLAYER_HORIZONTAL_INSET = 16;
const SWIPE_DISTANCE = 64;

export function FlowDetailContent() {
  const { user } = useAuth();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const session = useFlowViewerSessionStore((state) => state.session);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const openCommentSheet = useOpenCommentSheet();

  const feed = useFlowFeedInfinite({
    variant: session?.variant ?? "home",
    filters: session?.filters ?? null,
    authorId: session?.authorId ?? undefined,
    enabled: true,
  });

  const resolvedPostId = typeof postId === "string" ? postId : postId?.[0];

  const cachedPost = useMemo(
    () =>
      resolvedPostId
        ? feed.posts.find((entry) => entry.id === resolvedPostId) ?? null
        : null,
    [feed.posts, resolvedPostId]
  );

  useEffect(() => {
    if (!resolvedPostId) {
      return;
    }

    if (cachedPost) {
      setPost(cachedPost);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchPostById(resolvedPostId)
      .then((data) => {
        if (cancelled) {
          return;
        }
        if (!data) {
          setError("Flow bulunamadı.");
          setPost(null);
          return;
        }
        if (!isFlowPost(data)) {
          setError("Bu içerik Flow değil.");
          setPost(null);
          return;
        }
        setPost(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getUserFacingErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cachedPost, resolvedPostId]);

  const handleScoreUpdate = useCallback(
    (id: string, postScore: number) => {
      setPost((prev) => (prev && prev.id === id ? { ...prev, postScore } : prev));
      feed.updatePostScore(id, postScore);
    },
    [feed.updatePostScore]
  );

  const activePost = cachedPost ?? post;

  if (loading && !activePost) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if ((error && !activePost) || !activePost || !resolvedPostId) {
    return (
      <View style={styles.errorWrap}>
        <View className="rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error ?? "Flow bulunamadı."}</Text>
        </View>
      </View>
    );
  }

  return (
    <PostInteractionProvider currentUserId={user?.uid ?? null}>
      <FlowDetailBody
        activePostId={resolvedPostId}
        post={activePost}
        currentUserId={user?.uid ?? null}
        onScoreUpdate={handleScoreUpdate}
        onOpenComments={() =>
          openCommentSheet(resolvedPostId, (result) => {
            if (typeof result.postScore === "number") {
              handleScoreUpdate(resolvedPostId, result.postScore);
            }
            setPost((prev) =>
              prev && prev.id === resolvedPostId
                ? {
                    ...prev,
                    commentCount: result.counts.commentCount ?? prev.commentCount,
                  }
                : prev
            );
          })
        }
      />
    </PostInteractionProvider>
  );
}

type FlowDetailBodyProps = {
  activePostId: string;
  post: Post;
  currentUserId: string | null;
  onScoreUpdate: (postId: string, postScore: number) => void;
  onOpenComments: () => void;
};

function FlowDetailBody({
  activePostId,
  post,
  currentUserId,
  onScoreUpdate,
  onOpenComments,
}: FlowDetailBodyProps) {
  const navigation = useFlowDetailNavigation(activePostId);
  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);

  const handlePostDeleted = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  }, []);

  const handlePostContentUpdated = useCallback(
    (_postId: string, content: string) => {
      // displayPost already reflects the edit; keep parent caption in sync if needed later.
      void content;
    },
    []
  );

  const owner = usePostCardOwnerActions({
    post,
    currentUserId,
    onPostDeleted: handlePostDeleted,
    onPostContentUpdated: handlePostContentUpdated,
  });

  const {
    counts,
    shareActive,
    saveActive,
    loading: voteLoading,
    handleLike,
    handleDislike,
    handleSave,
    handleSharePress,
    shareSheetOpen,
    setShareSheetOpen,
    repostOpen,
    setRepostOpen,
    canRepost,
    handleRepostSelect,
    handleExternalShareSelect,
    handleReposted,
  } = useShareAndRepost({
    post: owner.displayPost,
    currentUserId,
    onScoreUpdate,
  });

  const overlayPost = owner.displayPost;

  const handleSwipeNext = useCallback(() => {
    if (navigation.canGoNext) {
      navigation.goToNext();
    }
  }, [navigation]);

  const handleSwipePrevious = useCallback(() => {
    if (navigation.canGoPrevious) {
      navigation.goToPrevious();
    }
  }, [navigation]);

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-28, 28])
        .failOffsetX([-24, 24])
        .onEnd((event) => {
          if (event.translationY <= -SWIPE_DISTANCE) {
            runOnJS(handleSwipeNext)();
            return;
          }
          if (event.translationY >= SWIPE_DISTANCE) {
            runOnJS(handleSwipePrevious)();
          }
        }),
    [handleSwipeNext, handleSwipePrevious]
  );

  return (
    <View style={styles.screen}>
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.playerWrap}>
          <FlowPlayerPool
            current={post}
            previous={navigation.previousPost}
            next={navigation.nextPost}
          />
        </View>
      </GestureDetector>

      {/* Sibling overlay layer — stays above Android WebView surface. */}
      <View pointerEvents="box-none" style={styles.overlayLayer}>
        <FlowDetailOverlays
          post={overlayPost}
          currentUserId={currentUserId}
          counts={counts}
          postScore={overlayPost.postScore ?? 0}
          shareActive={shareActive}
          saveActive={saveActive}
          voteLoading={voteLoading}
          tapShieldEnabled={overlayPost.provider === "youtube"}
          onLike={handleLike}
          onDislike={handleDislike}
          onComment={onOpenComments}
          onShare={handleSharePress}
          onSave={handleSave}
          onMenuPress={
            isOwner ? owner.handleOwnerMenuPress : owner.handleMoreMenuPress
          }
        />
      </View>

      {owner.editOpen ? (
        <EditPostTextModal
          visible
          contentType={post.contentType ?? "flow"}
          initialContent={owner.displayPost.content ?? ""}
          submitting={owner.ownerActionLoading}
          onClose={() => owner.setEditOpen(false)}
          onSave={owner.handleEditSave}
        />
      ) : null}

      <PostCardOwnerSheets
        post={post}
        ownerMenuOpen={owner.ownerMenuOpen}
        moreMenuOpen={owner.moreMenuOpen}
        deleteConfirmOpen={owner.deleteConfirmOpen}
        reportMenuOpen={owner.reportMenuOpen}
        ownerActionLoading={owner.ownerActionLoading}
        onCloseOwnerMenu={() => owner.setOwnerMenuOpen(false)}
        onCloseMoreMenu={() => owner.setMoreMenuOpen(false)}
        onCloseDeleteConfirm={() => owner.setDeleteConfirmOpen(false)}
        onCloseReportMenu={() => owner.setReportMenuOpen(false)}
        onEdit={owner.handleEditFromMenu}
        onRequestDelete={owner.handleRequestDelete}
        onConfirmDelete={() => void owner.handleConfirmDelete()}
        onOpenReportMenu={owner.handleOpenReportMenu}
        onReportReason={owner.handleReportReason}
      />

      <PostShareModals
        post={overlayPost}
        shareSheetOpen={shareSheetOpen}
        onCloseShareSheet={() => setShareSheetOpen(false)}
        repostOpen={repostOpen}
        onCloseRepost={() => setRepostOpen(false)}
        canRepost={canRepost}
        shareLoading={voteLoading}
        onRepostSelect={handleRepostSelect}
        onExternalShare={handleExternalShareSelect}
        onReposted={handleReposted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
    paddingVertical: PLAYER_VERTICAL_INSET,
    paddingHorizontal: PLAYER_HORIZONTAL_INSET,
  },
  playerWrap: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000000",
    overflow: "hidden",
    borderRadius: 12,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    marginVertical: PLAYER_VERTICAL_INSET,
    marginHorizontal: PLAYER_HORIZONTAL_INSET,
    zIndex: 60,
    elevation: 60,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  errorWrap: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});
