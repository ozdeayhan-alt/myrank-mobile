import { memo } from "react";
import { Platform, Text, View } from "react-native";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { ui } from "@/lib/uiClasses";
import type { Post } from "../types";
import { postBodyText } from "../utils/postBodyText";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "../utils/resolvePostAuthor";
import { isVideoPost } from "../utils/videoPosts";
import { PostFeedMedia } from "./PostFeedMedia";
import { PostScorePill } from "./PostScorePill";

const LITE_MEDIA_PLACEHOLDER_HEIGHT = 220;

type FeedPostCellLiteProps = {
  post: Post;
};

function FeedPostCellLiteInner({ post }: FeedPostCellLiteProps) {
  const displayName = resolvePostAuthorDisplayName(post);
  const photoURL = resolvePostAuthorPhotoURL(post);
  const bodyText = postBodyText(post);
  const hasMedia =
    post.contentType === "image" ||
    isVideoPost(post) ||
    Boolean(post.mediaURL?.trim());

  return (
    <View
      className={ui.postCard}
      style={Platform.OS === "android" ? { elevation: 2 } : undefined}
    >
      <View className="flex-row items-center justify-between px-4 pb-2.5 pt-3.5">
        <View className="mr-3 flex-1 flex-row items-center">
          <ProfileAvatar
            size={40}
            photoURL={photoURL}
            fallbackLetter={resolvePostAuthorInitial(post)}
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </View>
        <PostScorePill score={post.postScore ?? 0} />
      </View>

      {bodyText ? (
        <View className="px-4 pb-3">
          <Text className="text-sm text-gray-800" numberOfLines={4}>
            {bodyText}
          </Text>
        </View>
      ) : null}

      {hasMedia ? (
        <PostFeedMedia
          post={post}
          imagePriority="low"
          placeholderHeight={LITE_MEDIA_PLACEHOLDER_HEIGHT}
        />
      ) : null}
    </View>
  );
}

export const FeedPostCellLite = memo(FeedPostCellLiteInner);
