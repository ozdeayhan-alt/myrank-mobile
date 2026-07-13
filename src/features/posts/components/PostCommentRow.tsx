import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { PostComment } from "@/features/ranking/types";
import {
  resolveCommentAuthorDisplayName,
  resolveCommentAuthorInitial,
  resolveCommentAuthorPhotoURL,
} from "@/features/ranking/utils/resolveCommentAuthor";

type PostCommentRowProps = {
  comment: PostComment;
  onReply?: (comment: PostComment) => void;
};

export const PostCommentRow = memo(function PostCommentRow({
  comment,
  onReply,
}: PostCommentRowProps) {
  const displayName = resolveCommentAuthorDisplayName(comment);
  const isReply = Boolean(comment.parentCommentId);

  return (
    <View
      className={`mb-3 flex-row rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 ${
        isReply ? "ml-6" : ""
      }`}
    >
      <ProfileAvatar
        photoURL={resolveCommentAuthorPhotoURL(comment)}
        fallbackLetter={resolveCommentAuthorInitial(comment)}
        size={36}
        style={{ marginRight: 10 }}
      />
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-gray-900">{displayName}</Text>
        {comment.replyToDisplayName ? (
          <Text className="mt-0.5 text-xs text-gray-500">
            @{comment.replyToDisplayName} yanıt
          </Text>
        ) : null}
        <Text className="mt-1 text-sm text-gray-800">{comment.commentText}</Text>
        {onReply && !isReply ? (
          <Pressable
            onPress={() => onReply(comment)}
            hitSlop={8}
            className="mt-2 self-start"
            accessibilityRole="button"
            accessibilityLabel="Yanıtla"
          >
            <Text className="text-xs font-semibold text-gray-500">Yanıtla</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
