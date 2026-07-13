import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import type { Post } from "../types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "../utils/resolvePostAuthor";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import { FeedStreamMedia } from "./FeedStreamMedia";
import { PostFeedMedia } from "./PostFeedMedia";
import { getContentTypeLabel } from "../constants/contentTypeLabels";

type EmbeddedOriginalPostProps = PostFeedMediaLayoutOptions & {
  post: Post;
  variant?: "feed" | "compact";
  currentUserId?: string | null;
  streamMedia?: boolean;
  imagePriority?: "low" | "normal" | "high";
};

function postBodyText(post: Post): string | null {
  const text = post.content?.trim();
  if (!text) {
    return post.mediaURL ? null : null;
  }
  return text;
}

export function EmbeddedOriginalPost({
  post,
  variant = "feed",
  currentUserId = null,
  listHorizontalInset,
  mediaEdgeBleed,
  streamMedia = false,
  imagePriority = "normal",
}: EmbeddedOriginalPostProps) {
  const compact = variant === "compact";
  const router = useRouter();
  const displayName = resolvePostAuthorDisplayName(post);
  const photoURL = resolvePostAuthorPhotoURL(post);
  const bodyText = postBodyText(post);

  const openOriginal = () => {
    if (post.id && post.id !== "embedded" && post.id !== "original") {
      router.push(`/post/${post.id}`);
    }
  };

  const openAuthorProfile = () => {
    navigateToAuthorProfile(post.authorId, currentUserId ?? undefined, {
      displayName,
      photoURL,
    });
  };

  return (
    <Pressable
      onPress={openOriginal}
      className={`${compact ? "mx-0" : "mx-4"} mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50`}
      accessibilityRole="button"
      accessibilityLabel="Orijinal gönderiyi aç"
    >
      <View className="flex-row items-center px-3 py-2">
        <Pressable onPress={openAuthorProfile} hitSlop={8}>
          <ProfileAvatar
            size={28}
            photoURL={photoURL}
            fallbackLetter={resolvePostAuthorInitial(post)}
          />
        </Pressable>
        <Pressable className="ml-2 flex-1" onPress={openAuthorProfile}>
          <Text className="text-xs font-semibold text-gray-900" numberOfLines={1}>
            {displayName}
          </Text>
          <Text className="text-[10px] text-gray-400 capitalize">
            {getContentTypeLabel(post.contentType)}
          </Text>
        </Pressable>
      </View>

      {bodyText && post.contentType === "tweet" ? (
        <View className="px-3 pb-2">
          <Text
            className="text-base text-gray-800"
            numberOfLines={compact ? 3 : undefined}
          >
            {bodyText}
          </Text>
        </View>
      ) : null}

      {streamMedia ? (
        <FeedStreamMedia
          post={post}
          imagePriority={imagePriority}
          listHorizontalInset={listHorizontalInset}
          mediaEdgeBleed={mediaEdgeBleed}
        />
      ) : (
        <PostFeedMedia
          post={post}
          variant={variant}
          listHorizontalInset={listHorizontalInset}
          mediaEdgeBleed={mediaEdgeBleed}
        />
      )}

      {bodyText && post.contentType !== "tweet" ? (
        <View className="px-3 py-2">
          <Text
            className="text-sm text-gray-800"
            numberOfLines={compact ? 2 : undefined}
          >
            {bodyText}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
