import { Pressable, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";

type PostInteractionRailProps = {
  counts: PostCounts;
  shareActive: boolean;
  saveActive: boolean;
  loading: boolean;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  variant?: "feed" | "reels";
  bottomInset?: number;
};

function RailButton({
  label,
  sub,
  onPress,
  disabled,
  active,
  light,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  light?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="mb-5 items-center"
      hitSlop={8}
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
    </Pressable>
  );
}

export function PostInteractionRail({
  counts,
  shareActive,
  saveActive,
  loading,
  onLike,
  onDislike,
  onComment,
  onShare,
  onSave,
  variant = "feed",
  bottomInset = 0,
}: PostInteractionRailProps) {
  const light = variant === "reels";

  return (
    <View
      className={
        variant === "reels"
          ? "absolute right-3 z-20 items-center"
          : "flex-row flex-wrap px-1 py-1"
      }
      style={
        variant === "reels"
          ? { bottom: bottomInset + 112 }
          : undefined
      }
    >
      <RailButton
        light={light}
        label="👍"
        onPress={onLike}
        disabled={loading}
      />
      <RailButton
        light={light}
        label="👎"
        onPress={onDislike}
        disabled={loading}
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
