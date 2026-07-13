import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatRelativeTime } from "@/features/notifications/utils/formatRelativeTime";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { Post } from "../types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "../utils/resolvePostAuthor";
import { getContentTypeLabel } from "../constants/contentTypeLabels";
import { PostFollowPlusButton } from "./PostFollowPlusButton";
import { PostScoreDisplay } from "./PostScoreDisplay";
import { FEED_AVATAR_SIZE } from "./postFeedHeaderLayout";

function resolveContentTypeLabel(contentType: Post["contentType"]): string | null {
  if (!contentType) return null;
  if (contentType === "repost") {
    return "Repost";
  }
  return getContentTypeLabel(contentType);
}

function resolveSecondaryLabel(post: Post): string | null {
  if (post.createdAt) {
    const relative = formatRelativeTime(post.createdAt);
    if (relative) return relative;
  }
  return resolveContentTypeLabel(post.contentType);
}

function shouldShowPostFollowCta(
  post: Post,
  isOwner: boolean,
  currentUserId: string | null
): boolean {
  if (!currentUserId || isOwner) {
    return false;
  }
  return (
    post.contentType === "tweet" ||
    post.contentType === "image" ||
    post.contentType === "flow"
  );
}

type PostHeaderProps = {
  post: Post;
  isOwner?: boolean;
  currentUserId?: string | null;
};

export const PostHeader = memo(function PostHeader({
  post,
  isOwner = false,
  currentUserId = null,
}: PostHeaderProps) {
  const displayName = resolvePostAuthorDisplayName(post);
  const photoURL = resolvePostAuthorPhotoURL(post);
  const secondaryLabel = resolveSecondaryLabel(post);
  const showFollowCta = shouldShowPostFollowCta(post, isOwner, currentUserId);

  const openAuthorProfile = () => {
    navigateToAuthorProfile(post.authorId, currentUserId ?? undefined, {
      displayName,
      photoURL,
    });
  };

  return (
    <View className="flex-row items-center justify-between px-4 pb-2.5 pt-3.5">
      <View className="mr-3 min-w-0 flex-1 flex-row items-center">
        <ProfileAvatar
          size={FEED_AVATAR_SIZE}
          photoURL={photoURL}
          fallbackLetter={resolvePostAuthorInitial(post)}
        />
        <Pressable
          className="ml-3 min-w-0 flex-1"
          onPress={openAuthorProfile}
          hitSlop={4}
          accessibilityRole="button"
        >
          <Text
            className="text-sm font-semibold text-gray-900"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {secondaryLabel ? (
            <Text className="text-xs text-gray-400">{secondaryLabel}</Text>
          ) : null}
        </Pressable>
      </View>
      <View className="flex-row items-center gap-2">
        {showFollowCta ? (
          <PostFollowPlusButton targetUserId={post.authorId} />
        ) : null}
        <PostScoreDisplay
          postId={post.id}
          initialScore={post.postScore ?? 0}
        />
      </View>
    </View>
  );
});
