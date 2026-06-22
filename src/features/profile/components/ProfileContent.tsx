import { useScrollToTop } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import { useAuth } from "@/features/auth";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { collectVideoPostsForPlaylist } from "@/features/posts/utils/videoPosts";
import type { UserMetadata } from "../types";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";
import { isMetadataComplete } from "../types";
import { getProfile } from "../api/getProfile";
import { useAuthorPosts } from "../hooks/useAuthorPosts";
import { useProfileSummarySeed } from "../hooks/useProfileSummarySeed";
import { publicProfileQueryKey } from "../hooks/usePublicProfile";
import { useProfileStore } from "../store/useProfileStore";
import { ProfileContentHeader } from "./ProfileContentHeader";
import { ProfileVoteProvider } from "./ProfileVoteProvider";
import { PROFILE_HORIZONTAL_PADDING } from "../profileLayout";

type ProfileContentProps = {
  userId: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  bioCategoryVisibility?: BioCategoryVisibility;
  /** Başka kullanıcı profili için Firestore TP; kendi profilde store kullanılır */
  loadedTotalScore: number;
  metadata: UserMetadata;
  isOwnProfile?: boolean;
};

type ProfileFeedBodyProps = Omit<ProfileContentProps, "loadedTotalScore"> & {
  rankingsReady: boolean;
  currentUserId: string | null;
};

function ProfileFeedBody({
  userId,
  displayName,
  photoURL,
  bio = "",
  bioCategoryVisibility,
  metadata,
  isOwnProfile = false,
  rankingsReady,
  currentUserId,
}: ProfileFeedBodyProps) {
  const listRef = useRef<FlashListRef<FeedListItem>>(null);
  useScrollToTop(listRef);

  useProfileSummarySeed(userId, rankingsReady);

  const queryClient = useQueryClient();
  const setStoreTotalScore = useProfileStore((s) => s.setTotalScore);

  const {
    posts,
    loading,
    error,
    refresh,
    removePost,
    updatePostContent,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAuthorPosts(userId);

  const items = useMemo(
    (): FeedListItem[] =>
      posts.map((post) => ({
        kind: "post",
        key: post.id,
        post,
      })),
    [posts]
  );

  const videoPosts = useMemo(() => collectVideoPostsForPlaylist(posts), [posts]);

  const handleRefresh = useCallback(() => {
    const tasks: Promise<unknown>[] = [refresh()];

    if (isOwnProfile) {
      tasks.push(
        getProfile(userId).then((remote) => {
          if (remote) {
            setStoreTotalScore(remote.totalScore);
          }
        })
      );
    } else {
      tasks.push(
        queryClient.refetchQueries({ queryKey: publicProfileQueryKey(userId) })
      );
    }

    void Promise.all(tasks);
  }, [refresh, isOwnProfile, userId, setStoreTotalScore, queryClient]);

  const listHeader = useMemo(
    () => (
      <ProfileContentHeader
        userId={userId}
        displayName={displayName}
        photoURL={photoURL}
        bio={bio}
        bioCategoryVisibility={bioCategoryVisibility}
        metadata={metadata}
        isOwnProfile={isOwnProfile}
        rankingsReady={rankingsReady}
        currentUserId={currentUserId}
      />
    ),
    [
      userId,
      displayName,
      photoURL,
      bio,
      bioCategoryVisibility,
      metadata,
      isOwnProfile,
      rankingsReady,
      currentUserId,
    ]
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: PROFILE_HORIZONTAL_PADDING,
      paddingBottom: 32,
    }),
    []
  );

  return (
    <FeedFlashList
      items={items}
      videoPosts={videoPosts}
      loading={loading}
      error={error}
      emptyMessage="Henüz gönderi yok."
      onRefresh={handleRefresh}
      isRefetching={isRefetching}
      engagementResetKey={`profile-${userId}`}
      onPostDeleted={removePost}
      onPostContentUpdated={updatePostContent}
      ListHeaderComponent={listHeader}
      contentContainerStyle={contentContainerStyle}
      listRef={listRef}
      extraData={rankingsReady}
      currentUserId={currentUserId}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
      listHorizontalInset={PROFILE_HORIZONTAL_PADDING}
      mediaEdgeBleed={false}
      reelsSource="profile"
      reelsAuthorId={userId}
    />
  );
}

export function ProfileContent({
  userId,
  displayName,
  photoURL,
  bio = "",
  bioCategoryVisibility,
  loadedTotalScore,
  metadata,
  isOwnProfile = false,
}: ProfileContentProps) {
  const { user } = useAuth();
  const rankingsReady = isMetadataComplete(metadata);

  return (
    <ProfileVoteProvider
      targetUserId={userId}
      loadedTotalScore={loadedTotalScore}
      isOwnProfile={isOwnProfile}
    >
      <ProfileFeedBody
        userId={userId}
        displayName={displayName}
        photoURL={photoURL}
        bio={bio}
        bioCategoryVisibility={bioCategoryVisibility}
        metadata={metadata}
        isOwnProfile={isOwnProfile}
        rankingsReady={rankingsReady}
        currentUserId={user?.uid ?? null}
      />
    </ProfileVoteProvider>
  );
}
