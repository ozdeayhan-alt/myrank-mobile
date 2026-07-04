import { useScrollToTop } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { HomeFeedContentFilter } from "@/components/HomeFeedContentFilter";
import { useAuth } from "@/features/auth";
import { toFeedApiContentType } from "@/features/feed/feedContentType";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { getEmptyFeedMessage } from "@/features/posts/constants/contentTypeLabels";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import type { UserMetadata } from "../types";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";
import { isMetadataComplete } from "../types";
import { getProfile } from "../api/getProfile";
import { useAuthorPosts } from "../hooks/useAuthorPosts";
import {
  profileSummaryQueryKey,
  useProfileSummary,
} from "../hooks/useProfileSummary";
import {
  profileGaugeBootstrapQueryKey,
  useProfileGaugeBootstrap,
} from "../hooks/useProfileGaugeBootstrap";
import { useProfileStore } from "../store/useProfileStore";
import { ProfileContentHeader } from "./ProfileContentHeader";
import { ProfileVoteArrowFountainOverlay } from "./ProfileVoteArrowFountainOverlay";
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
  contentFilter: HomeFeedContentFilterValue;
  onContentFilterChange: (filter: HomeFeedContentFilterValue) => void;
};

type HomeFeedContentFilterValue = import("@/features/posts/store/useHomeFeedContentStore").HomeFeedContentFilter;

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
  contentFilter,
  onContentFilterChange,
}: ProfileFeedBodyProps) {
  const listRef = useRef<FlashListRef<FeedListItem>>(null);
  useScrollToTop(listRef);

  const ownProfileHydrated = useProfileStore(
    (s) =>
      isOwnProfile &&
      s.profileOwnerId === userId &&
      isMetadataComplete(s.metadata) &&
      s.profileSavedOnServer
  );

  const gaugeBootstrapQuery = useProfileGaugeBootstrap(
    userId,
    metadata,
    isOwnProfile && Boolean(userId)
  );
  const summaryQuery = useProfileSummary(
    userId,
    metadata,
    Boolean(userId) && !isOwnProfile
  );

  const profileBootstrapReady = isOwnProfile
    ? gaugeBootstrapQuery.isFetched
    : summaryQuery.isFetched;

  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);
  const setStoreTotalScore = useProfileStore((s) => s.setTotalScore);

  const authorPostsEnabled =
    Boolean(userId) && (ownProfileHydrated || profileBootstrapReady);
  const apiContentType = toFeedApiContentType(contentFilter);

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
    isFetching,
    fetchNextPage,
  } = useAuthorPosts(userId, apiContentType, authorPostsEnabled);

  const items = useMemo(
    (): FeedListItem[] =>
      posts.map((post) => ({
        kind: "post",
        key: post.id,
        post,
      })),
    [posts]
  );

  const emptyMessage = useMemo(() => {
    if (contentFilter === "tweet" || contentFilter === "image") {
      return getEmptyFeedMessage(contentFilter);
    }
    return "Henüz gönderi yok.";
  }, [contentFilter]);

  const handleRefresh = useCallback(() => {
    const tasks: Promise<unknown>[] = [refresh()];

    if (isOwnProfile) {
      tasks.push(
        getProfile(userId).then((remote) => {
          if (remote) {
            setStoreTotalScore(remote.totalScore);
          }
        }),
        queryClient.refetchQueries({
          queryKey: profileGaugeBootstrapQueryKey(userId, feedVersion),
        })
      );
    } else {
      tasks.push(
        queryClient.refetchQueries({
          queryKey: profileSummaryQueryKey(userId, feedVersion),
        })
      );
    }

    void Promise.all(tasks);
  }, [
    refresh,
    isOwnProfile,
    userId,
    setStoreTotalScore,
    queryClient,
    feedVersion,
  ]);

  const listHeader = useMemo(
    () => (
      <View>
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
        <View className="mb-4 mt-2">
          <HomeFeedContentFilter
            contentFilter={contentFilter}
            onContentFilterChange={onContentFilterChange}
          />
        </View>
      </View>
    ),
    [
      bio,
      bioCategoryVisibility,
      contentFilter,
      currentUserId,
      displayName,
      isOwnProfile,
      metadata,
      onContentFilterChange,
      photoURL,
      rankingsReady,
      userId,
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
      loading={loading}
      error={error}
      emptyMessage={emptyMessage}
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
      isFetching={isFetching}
      onLoadMore={fetchNextPage}
      listHorizontalInset={PROFILE_HORIZONTAL_PADDING}
      mediaEdgeBleed={false}
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
  const [contentFilter, setContentFilter] =
    useState<HomeFeedContentFilterValue>(null);

  return (
    <ProfileVoteProvider
      targetUserId={userId}
      loadedTotalScore={loadedTotalScore}
      isOwnProfile={isOwnProfile}
    >
      <View style={{ flex: 1 }}>
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
          contentFilter={contentFilter}
          onContentFilterChange={setContentFilter}
        />
        <ProfileVoteArrowFountainOverlay />
      </View>
    </ProfileVoteProvider>
  );
}
