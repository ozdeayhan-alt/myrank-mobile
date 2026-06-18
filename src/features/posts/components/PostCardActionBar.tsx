import { Pressable, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";
import { ui } from "@/lib/uiClasses";
import { formatActionSubLabel } from "../utils/formatActionSubLabel";
import { PostVoteCirclePair } from "./PostVoteCirclePair";

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
    <View
      className="flex-row items-center border-b border-gray-50 px-2 py-1"
      style={{ minHeight: 56 }}
    >
      <View className="flex-1 items-start justify-center pl-1">
        <Pressable
          className="items-center py-2"
          onPress={onCommentPress}
          disabled={loading}
          accessibilityLabel="Yorum yap"
        >
          <Text className="text-sm text-gray-600">💬 {counts.commentCount}</Text>
          <Text className="text-[10px] text-gray-400">
            {formatActionSubLabel("comment", false)}
          </Text>
        </Pressable>
      </View>

      <View className="items-center justify-center px-1">
        <PostVoteCirclePair
          variant="feed"
          disabled={loading}
          onUp={onLikePress}
          onDown={onDislikePress}
        />
      </View>

      <View className="flex-1 flex-row items-center justify-end gap-1 pr-1">
        <Pressable
          className={`min-w-[44px] items-center py-2 ${shareActive ? ui.activeRow : ""}`}
          onPress={onSharePress}
          disabled={loading}
          accessibilityLabel="Paylaş"
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
          className={`min-w-[44px] items-center py-2 ${saveActive ? ui.activeRow : ""}`}
          onPress={onSavePress}
          disabled={loading}
          accessibilityLabel="Kaydet"
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
    </View>
  );
}
