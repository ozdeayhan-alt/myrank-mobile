import { Pressable, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";
import { ui } from "@/lib/uiClasses";
import { formatActionSubLabel } from "../utils/formatActionSubLabel";

type PostCardActionBarProps = {
  counts: PostCounts;
  shareActive: boolean;
  saveActive: boolean;
  loading: boolean;
  onLikePress: () => void;
  onDislikePress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  onSavePress: () => void;
};

export function PostCardActionBar({
  counts,
  shareActive,
  saveActive,
  loading,
  onLikePress,
  onDislikePress,
  onCommentPress,
  onSharePress,
  onSavePress,
}: PostCardActionBarProps) {
  return (
    <View className="flex-row flex-wrap border-b border-gray-50 px-1 py-1">
      <Pressable
        className="min-w-[20%] flex-1 items-center px-1 py-2"
        onPress={onLikePress}
        disabled={loading}
        accessibilityLabel="Beğen"
      >
        <Text className="text-sm text-gray-600">👍</Text>
      </Pressable>
      <Pressable
        className="min-w-[20%] flex-1 items-center py-2"
        onPress={onDislikePress}
        disabled={loading}
        accessibilityLabel="Beğenme"
      >
        <Text className="text-sm text-gray-600">👎</Text>
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
