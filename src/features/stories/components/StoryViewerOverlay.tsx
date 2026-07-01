import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import { PostScorePill } from "@/features/posts/components/PostScorePill";
import { PostVoteCirclePair } from "@/features/posts/components/PostVoteCirclePair";
import type { Story } from "../constants/types";
import { useStoryInteractions } from "../hooks/useStoryInteractions";
import { StoryInsightsSheet } from "./StoryInsightsSheet";

const AVATAR_SIZE = 44;
const VOTE_ABOVE_BOTTOM = 120;

type StoryViewerOverlayProps = {
  story: Story;
  currentUserId: string | null;
  active: boolean;
  onViewCountChange?: (storyId: string, viewCount: number) => void;
};

export function StoryViewerOverlay({
  story,
  currentUserId,
  active,
  onViewCountChange,
}: StoryViewerOverlayProps) {
  const insets = useSafeAreaInsets();
  const [insightsOpen, setInsightsOpen] = useState(false);

  const {
    isOwner,
    votesEnabled,
    displayScore,
    viewCount,
    handleUp,
    handleDown,
  } = useStoryInteractions({
    story,
    currentUserId,
    active,
    onViewCountChange,
  });

  const bottomBlockBottom = insets.bottom + 16;
  const displayName = story.authorDisplayName || "Kullanıcı";
  const caption = story.caption?.trim();

  return (
    <View pointerEvents="box-none" className="absolute inset-0 z-30">
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: insets.top + 52,
          right: 12,
          zIndex: 32,
        }}
      >
        <PostScorePill score={displayScore} variant="reels" />
      </View>

      {votesEnabled ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: bottomBlockBottom + VOTE_ABOVE_BOTTOM,
            alignItems: "center",
            zIndex: 32,
          }}
        >
          <PostVoteCirclePair
            variant="reels"
            onUp={handleUp}
            onDown={handleDown}
          />
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0"
        style={{ bottom: bottomBlockBottom, paddingLeft: 16, paddingRight: 16 }}
      >
        <Pressable
          className="flex-row items-center"
          onPress={() =>
            navigateToAuthorProfile(story.userId, currentUserId ?? undefined, {
              displayName,
              photoURL: story.authorPhotoURL ?? undefined,
            })
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${displayName} profilini aç`}
        >
          <ProfileAvatar
            size={AVATAR_SIZE}
            photoURL={story.authorPhotoURL ?? ""}
            fallbackLetter={displayName.slice(0, 1).toUpperCase()}
          />
          <Text
            className="ml-3 flex-1 text-base font-semibold text-white"
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </Pressable>
        {caption ? (
          <Text className="mt-2 text-sm text-white/95" numberOfLines={3}>
            {caption}
          </Text>
        ) : null}
      </View>

      {isOwner ? (
        <Pressable
          onPress={() => setInsightsOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`${viewCount} görüntüleme`}
          className="absolute left-0 right-0 items-center"
          style={{ bottom: bottomBlockBottom }}
        >
          <View className="flex-row items-center rounded-full bg-black/45 px-4 py-2">
            <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
            <Text className="ml-2 text-sm font-semibold text-white">
              {viewCount} görüntüleme
            </Text>
          </View>
        </Pressable>
      ) : null}

      <StoryInsightsSheet
        visible={insightsOpen}
        storyId={story.id}
        onClose={() => setInsightsOpen(false)}
      />
    </View>
  );
}
