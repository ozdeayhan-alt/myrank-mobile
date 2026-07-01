import { Pressable, Text, useWindowDimensions, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";
import { ui } from "@/lib/uiClasses";
import { getPostActionBarLayout } from "../utils/postActionBarLayout";
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

type ActionButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
  maxWidth: number;
};

function ActionButton({
  label,
  active,
  onPress,
  disabled,
  accessibilityLabel,
  maxWidth,
}: ActionButtonProps) {
  return (
    <Pressable
      className={`min-w-[40px] items-center py-2 ${active ? ui.activeRow : ""}`}
      style={{ maxWidth }}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
    >
      <Text
        className={`text-sm ${active ? ui.activeText : ui.inactiveText}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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
  const { width: screenWidth } = useWindowDimensions();
  const layout = getPostActionBarLayout(screenWidth);

  const votePair = (
    <PostVoteCirclePair
      variant="feed"
      disabled={loading}
      voteDiameter={layout.voteDiameter}
      onUp={onLikePress}
      onDown={onDislikePress}
    />
  );

  const commentButton = (
    <ActionButton
      label={`💬 ${counts.commentCount}`}
      active={false}
      onPress={onCommentPress}
      disabled={loading}
      accessibilityLabel="Yorum yap"
      maxWidth={layout.actionLabelMaxWidth}
    />
  );

  const shareButton = (
    <ActionButton
      label={`↗ ${counts.shareCount}`}
      active={shareActive}
      onPress={onSharePress}
      disabled={loading}
      accessibilityLabel="Paylaş"
      maxWidth={layout.actionLabelMaxWidth}
    />
  );

  const saveButton = (
    <ActionButton
      label={`🔖 ${counts.saveCount}`}
      active={saveActive}
      onPress={onSavePress}
      disabled={loading}
      accessibilityLabel="Kaydet"
      maxWidth={layout.actionLabelMaxWidth}
    />
  );

  if (layout.stacked) {
    return (
      <View className="border-b border-gray-50 px-2 py-1">
        <View className="flex-row items-center justify-between">
          {commentButton}
          <View className="flex-row items-center gap-1">
            {shareButton}
            {saveButton}
          </View>
        </View>
        <View className="items-center py-1">{votePair}</View>
      </View>
    );
  }

  return (
    <View
      className="flex-row items-center border-b border-gray-50 px-2 py-1"
      style={{ minHeight: 56 }}
    >
      <View
        className="flex-1 items-start justify-center pl-1"
        style={{ flexShrink: 1, overflow: "hidden" }}
      >
        {commentButton}
      </View>

      <View className="items-center justify-center px-1" style={{ flexShrink: 0 }}>
        {votePair}
      </View>

      <View
        className="flex-1 flex-row items-center justify-end gap-1 pr-1"
        style={{ flexShrink: 1, overflow: "hidden" }}
      >
        {shareButton}
        {saveButton}
      </View>
    </View>
  );
}
