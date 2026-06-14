import { memo } from "react";
import { Text, View } from "react-native";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { PostComment } from "@/features/ranking/types";
import {
  resolveCommentAuthorDisplayName,
  resolveCommentAuthorInitial,
  resolveCommentAuthorPhotoURL,
} from "@/features/ranking/utils/resolveCommentAuthor";

type PostCommentRowProps = {
  comment: PostComment;
};

export const PostCommentRow = memo(function PostCommentRow({
  comment,
}: PostCommentRowProps) {
  const displayName = resolveCommentAuthorDisplayName(comment);

  return (
    <View className="mb-3 flex-row rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <ProfileAvatar
        photoURL={resolveCommentAuthorPhotoURL(comment)}
        fallbackLetter={resolveCommentAuthorInitial(comment)}
        size={36}
        style={{ marginRight: 10 }}
      />
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-gray-900">{displayName}</Text>
        <Text className="mt-1 text-sm text-gray-800">{comment.commentText}</Text>
      </View>
    </View>
  );
});
