import { memo, type RefObject } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";
import { ui } from "@/lib/uiClasses";
import type { PostVoteButtonPulse } from "../hooks/usePostVoteFeedback";
import { getPostActionBarLayout } from "../utils/postActionBarLayout";
import type { PostVoteFountainHandle } from "./PostVoteFountainLayer";
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
  /** Owner edit/delete or report menu (⋯). */
  onMenuPress?: () => void;
  menuAccessibilityLabel?: string;
  fountainRef?: RefObject<PostVoteFountainHandle | null>;
  buttonPulseSeq?: number;
  lastButtonPulse?: PostVoteButtonPulse | null;
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

export const PostCardActionBar = memo(function PostCardActionBar({
  counts,
  shareActive,
  saveActive,
  loading,
  onLikePress,
  onDislikePress,
  onCommentPress,
  onSharePress,
  onSavePress,
  onMenuPress,
  menuAccessibilityLabel = "Gönderi seçenekleri",
  fountainRef,
  buttonPulseSeq,
  lastButtonPulse,
}: PostCardActionBarProps) {
  const { width: screenWidth } = useWindowDimensions();
  const layout = getPostActionBarLayout(screenWidth);

  const menuButton = onMenuPress ? (
    <Pressable
      onPress={onMenuPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={menuAccessibilityLabel}
      className="h-9 w-9 items-center justify-center rounded-full bg-gray-50"
    >
      <Text className="text-lg font-bold text-gray-600">⋯</Text>
    </Pressable>
  ) : null;

  const votePair = (
    <PostVoteCirclePair
      disabled={loading}
      voteDiameter={layout.voteDiameter}
      onUp={onLikePress}
      onDown={onDislikePress}
      fountainRef={fountainRef}
      buttonPulseSeq={buttonPulseSeq}
      lastButtonPulse={lastButtonPulse}
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
          <View className="flex-row items-center">{menuButton}</View>
          <View className="flex-row items-center gap-1">
            {shareButton}
            {commentButton}
            {saveButton}
          </View>
        </View>
        <View className="items-center py-1">{votePair}</View>
      </View>
    );
  }

  return (
    <View
      className="relative flex-row items-center border-b border-gray-50 px-2 py-1"
      style={{ minHeight: 56 }}
    >
      <View
        className="flex-1 items-start justify-center pl-1"
        style={{ flexShrink: 1, overflow: "hidden" }}
      >
        {menuButton}
      </View>

      <View
        className="flex-1 flex-row items-center justify-end gap-1 pr-1"
        style={{
          flexShrink: 1,
          overflow: "hidden",
          paddingLeft: layout.rightActionsInset,
        }}
      >
        {commentButton}
        {saveButton}
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: "50%",
          transform: [{ translateX: layout.shareCenterOffsetX }],
        }}
      >
        <View pointerEvents="auto">{shareButton}</View>
      </View>

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: "50%",
          transform: [{ translateX: layout.voteCenterOffsetX }],
        }}
      >
        <View pointerEvents="auto">{votePair}</View>
      </View>
    </View>
  );
});
