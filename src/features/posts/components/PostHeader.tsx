import { Pressable, Text, View } from "react-native";
import { formatRelativeTime } from "@/features/notifications/utils/formatRelativeTime";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import type { Post } from "../types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "../utils/resolvePostAuthor";
import { PostScorePill } from "./PostScorePill";

const FEED_AVATAR_SIZE = 40;
const MENU_BUTTON_CLASS =
  "h-9 w-9 items-center justify-center rounded-full bg-gray-50";

function resolveContentTypeLabel(contentType: Post["contentType"]): string | null {
  if (!contentType) return null;
  switch (contentType) {
    case "tweet":
      return "Gönderi";
    case "image":
      return "Fotoğraf";
    case "video":
      return "Video";
    case "repost":
      return "Repost";
    default:
      return "Gönderi";
  }
}

function resolveSecondaryLabel(post: Post): string | null {
  if (post.createdAt) {
    const relative = formatRelativeTime(post.createdAt);
    if (relative) return relative;
  }
  return resolveContentTypeLabel(post.contentType);
}

type PostHeaderProps = {
  post: Post;
  score: number;
  isOwner?: boolean;
  currentUserId?: string | null;
  onOwnerMenuPress?: () => void;
  onMoreMenuPress?: () => void;
};

export function PostHeader({
  post,
  score,
  isOwner = false,
  currentUserId = null,
  onOwnerMenuPress,
  onMoreMenuPress,
}: PostHeaderProps) {
  const displayName = resolvePostAuthorDisplayName(post);
  const photoURL = resolvePostAuthorPhotoURL(post);
  const secondaryLabel = resolveSecondaryLabel(post);

  const openAuthorProfile = () => {
    navigateToAuthorProfile(post.authorId, currentUserId ?? undefined, {
      displayName,
      photoURL,
    });
  };

  return (
    <View className="flex-row items-center justify-between px-4 pb-2.5 pt-3.5">
      <View className="mr-3 flex-1 flex-row items-center">
        <Pressable
          onPress={openAuthorProfile}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${displayName} profilini aç`}
        >
          <ProfileAvatar
            size={FEED_AVATAR_SIZE}
            photoURL={photoURL}
            fallbackLetter={resolvePostAuthorInitial(post)}
          />
        </Pressable>
        <Pressable
          className="ml-3 flex-1"
          onPress={openAuthorProfile}
          hitSlop={4}
          accessibilityRole="button"
        >
          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
            {displayName}
          </Text>
          {secondaryLabel ? (
            <Text className="text-xs text-gray-400">{secondaryLabel}</Text>
          ) : null}
        </Pressable>
      </View>
      <View className="flex-row items-center gap-2">
        {isOwner ? (
          <Pressable
            onPress={onOwnerMenuPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Gönderi seçenekleri"
            className={MENU_BUTTON_CLASS}
          >
            <Text className="text-lg font-bold text-gray-600">⋯</Text>
          </Pressable>
        ) : onMoreMenuPress ? (
          <Pressable
            onPress={onMoreMenuPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Gönderi seçenekleri"
            className={MENU_BUTTON_CLASS}
          >
            <Text className="text-lg font-bold text-gray-600">⋯</Text>
          </Pressable>
        ) : null}
        <PostScorePill score={score} />
      </View>
    </View>
  );
}
