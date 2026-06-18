import { Pressable, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";

type PostInteractionRailProps = {
  counts: PostCounts;
  shareActive: boolean;
  saveActive: boolean;
  loading: boolean;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  bottomInset?: number;
};

function RailButton({
  label,
  sub,
  onPress,
  disabled,
  active,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="mb-5 items-center"
      hitSlop={8}
    >
      <Text
        className={`text-2xl ${active ? "text-gray-300" : "text-white"}`}
      >
        {label}
      </Text>
      {sub ? (
        <Text
          className={`mt-0.5 text-xs ${active ? "text-gray-400" : "text-white/90"}`}
        >
          {sub}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** Reels sağ rail — yorum, paylaş, kaydet (oylar altta ayrı). */
export function PostInteractionRail({
  counts,
  shareActive,
  saveActive,
  loading,
  onComment,
  onShare,
  onSave,
  bottomInset = 0,
}: PostInteractionRailProps) {
  return (
    <View
      className="absolute right-3 z-20 items-center"
      style={{ bottom: bottomInset + 24 }}
    >
      <RailButton
        label="💬"
        sub={String(counts.commentCount)}
        onPress={onComment}
        disabled={loading}
      />
      <RailButton
        label="↗"
        sub={String(counts.shareCount)}
        onPress={onShare}
        disabled={loading}
        active={shareActive}
      />
      <RailButton
        label="🔖"
        sub={String(counts.saveCount)}
        onPress={onSave}
        disabled={loading}
        active={saveActive}
      />
    </View>
  );
}
