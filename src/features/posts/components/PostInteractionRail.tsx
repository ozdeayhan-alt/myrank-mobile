import { Pressable, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";

type PostInteractionRailProps = {
  counts: PostCounts;
  shareActive: boolean;
  saveActive: boolean;
  likeActive?: boolean;
  dislikeActive?: boolean;
  loading: boolean;
  onLike: () => void;
  onLikeLongPress?: () => void;
  likeBonusLabel?: string | null;
  onDislike: () => void;
  onDislikeLongPress?: () => void;
  dislikeBonusLabel?: string | null;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  variant?: "feed" | "reels";
};

function RailButton({
  label,
  sub,
  extra,
  extraTone = "like",
  onPress,
  onLongPress,
  delayLongPress,
  disabled,
  active,
  light,
  accessibilityHint,
}: {
  label: string;
  sub?: string;
  extra?: string;
  extraTone?: "like" | "dislike";
  onPress: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  disabled?: boolean;
  active?: boolean;
  light?: boolean;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      disabled={disabled}
      className="mb-5 items-center"
      hitSlop={8}
      accessibilityHint={accessibilityHint}
    >
      <Text
        className={`text-2xl ${
          light
            ? active
              ? "text-gray-300"
              : "text-white"
            : active
              ? "text-gray-900"
              : "text-gray-700"
        }`}
      >
        {label}
      </Text>
      {sub ? (
        <Text
          className={`mt-0.5 text-xs ${
            light
              ? active
                ? "text-gray-400"
                : "text-white/90"
              : active
                ? "text-gray-800"
                : "text-gray-500"
          }`}
        >
          {sub}
        </Text>
      ) : null}
      {extra ? (
        <Text
          className={`text-[10px] ${
            extraTone === "dislike"
              ? light
                ? "text-red-200"
                : "text-red-500"
              : light
                ? "text-indigo-200"
                : "text-indigo-500"
          }`}
        >
          {extra}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function PostInteractionRail({
  counts,
  shareActive,
  saveActive,
  likeActive = false,
  dislikeActive = false,
  loading,
  onLike,
  onLikeLongPress,
  likeBonusLabel,
  onDislike,
  onDislikeLongPress,
  dislikeBonusLabel,
  onComment,
  onShare,
  onSave,
  variant = "feed",
}: PostInteractionRailProps) {
  const light = variant === "reels";

  return (
    <View
      className={
        variant === "reels"
          ? "absolute bottom-28 right-3 z-20 items-center"
          : "flex-row flex-wrap px-1 py-1"
      }
    >
      <RailButton
        light={light}
        label="👍"
        extra={likeBonusLabel ? `+${likeBonusLabel}` : undefined}
        onPress={onLike}
        onLongPress={onLikeLongPress}
        delayLongPress={450}
        disabled={loading}
        active={likeActive}
        accessibilityHint="Basılı tutarak bonus beğeni puanı seçin"
      />
      <RailButton
        light={light}
        label="👎"
        extra={dislikeBonusLabel ? `−${dislikeBonusLabel}` : undefined}
        extraTone="dislike"
        onPress={onDislike}
        onLongPress={onDislikeLongPress}
        delayLongPress={450}
        disabled={loading}
        active={dislikeActive}
        accessibilityHint="Basılı tutarak bonus beğenmeme puanı seçin"
      />
      <RailButton
        light={light}
        label="💬"
        sub={String(counts.commentCount)}
        onPress={onComment}
        disabled={loading}
      />
      <RailButton
        light={light}
        label="↗"
        sub={String(counts.shareCount)}
        onPress={onShare}
        disabled={loading}
        active={shareActive}
      />
      <RailButton
        light={light}
        label="🔖"
        sub={String(counts.saveCount)}
        onPress={onSave}
        disabled={loading}
        active={saveActive}
      />
    </View>
  );
}
