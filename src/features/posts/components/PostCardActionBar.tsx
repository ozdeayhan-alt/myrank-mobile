import { Pressable, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";
import { ui } from "@/lib/uiClasses";
import { formatActionSubLabel } from "../utils/formatActionSubLabel";

type PostCardActionBarProps = {
  counts: PostCounts;
  liked: boolean;
  disliked: boolean;
  shareActive: boolean;
  saveActive: boolean;
  loading: boolean;
  likeBonusPoints?: number | null;
  dislikeBonusPoints?: number | null;
  onLikePress: () => void;
  onLikeLongPress: () => void;
  onDislikePress: () => void;
  onDislikeLongPress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  onSavePress: () => void;
};

export function PostCardActionBar({
  counts,
  liked,
  disliked,
  shareActive,
  saveActive,
  loading,
  likeBonusPoints,
  dislikeBonusPoints,
  onLikePress,
  onLikeLongPress,
  onDislikePress,
  onDislikeLongPress,
  onCommentPress,
  onSharePress,
  onSavePress,
}: PostCardActionBarProps) {
  return (
    <View className="flex-row flex-wrap border-b border-gray-50 px-1 py-1">
      <Pressable
        className={`min-w-[20%] flex-1 items-center px-1 py-2 ${liked ? ui.activeRow : ""}`}
        onPress={onLikePress}
        onLongPress={onLikeLongPress}
        delayLongPress={450}
        disabled={loading}
        accessibilityHint="Basılı tutarak bonus beğeni puanı seçin"
      >
        <Text className={`text-sm ${liked ? ui.activeText : ui.inactiveText}`}>
          👍
        </Text>
        {likeBonusPoints ? (
          <Text className="text-[10px] text-indigo-500">+{likeBonusPoints}</Text>
        ) : null}
      </Pressable>
      <Pressable
        className={`min-w-[20%] flex-1 items-center py-2 ${disliked ? ui.activeRow : ""}`}
        onPress={onDislikePress}
        onLongPress={onDislikeLongPress}
        delayLongPress={450}
        disabled={loading}
        accessibilityHint="Basılı tutarak bonus beğenmeme puanı seçin"
      >
        <Text className={`text-sm ${disliked ? ui.activeText : ui.inactiveText}`}>
          👎
        </Text>
        {dislikeBonusPoints ? (
          <Text className="text-[10px] text-red-500">−{dislikeBonusPoints}</Text>
        ) : null}
      </Pressable>
      <Pressable
        className="min-w-[20%] flex-1 items-center py-2"
        onPress={onCommentPress}
        disabled={loading}
      >
        <Text className="text-sm text-gray-600">💬 {counts.commentCount}</Text>
        <Text className="text-[10px] text-gray-400">
          {formatActionSubLabel("comment", false)}
        </Text>
      </Pressable>
      <Pressable
        className={`min-w-[20%] flex-1 items-center py-2 ${shareActive ? ui.activeRow : ""}`}
        onPress={onSharePress}
        disabled={loading}
      >
        <Text
          className={`text-sm ${shareActive ? ui.activeText : ui.inactiveText}`}
        >
          ↗ {counts.shareCount}
        </Text>
        <Text className="text-[10px] text-gray-400">
          {formatActionSubLabel("share", shareActive)}
        </Text>
      </Pressable>
      <Pressable
        className={`min-w-[20%] flex-1 items-center py-2 ${saveActive ? ui.activeRow : ""}`}
        onPress={onSavePress}
        disabled={loading}
      >
        <Text
          className={`text-sm ${saveActive ? ui.activeText : ui.inactiveText}`}
        >
          🔖 {counts.saveCount}
        </Text>
        <Text className="text-[10px] text-gray-400">
          {formatActionSubLabel("save", saveActive)}
        </Text>
      </Pressable>
    </View>
  );
}
