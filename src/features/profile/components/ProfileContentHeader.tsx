import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo, useMemo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { ProfileHeaderButton } from "@/components/ProfileHeaderButton";
import { ProfileUserMenuButton } from "@/features/blocks";
import { WhileYouWereAwaySection } from "@/features/notifications";
import type { UserMetadata } from "../types";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";
import { hasVisibleBioCategory } from "../utils/bioCategoryVisibility";
import { formatProfileCategoriesLine } from "../utils/formatProfileCategoriesLine";
import {
  PROFILE_EDGE_INSET,
  PROFILE_HORIZONTAL_PADDING,
  PROFILE_MENU_RIGHT_INSET,
} from "../profileLayout";
import { isSystemProfileUserId } from "@/lib/profile/isSystemProfile";
import { SystemProfileBadge } from "@/components/SystemProfileBadge";
import { ProfileStoryAvatar } from "@/features/stories/components/ProfileStoryAvatar";
import { ProfileRankingsAccordion } from "./ProfileRankingsAccordion";
import { ProfileSegmentRankBadge } from "./ProfileSegmentRankBadge";

type ProfileContentHeaderProps = {
  userId: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  bioCategoryVisibility?: BioCategoryVisibility;
  metadata: UserMetadata;
  isOwnProfile: boolean;
  rankingsReady: boolean;
  scoreSlot: ReactNode;
  currentUserId?: string | null;
};

function ProfileContentHeaderInner({
  userId,
  displayName,
  photoURL,
  bio = "",
  bioCategoryVisibility,
  metadata,
  isOwnProfile,
  rankingsReady,
  scoreSlot,
  currentUserId = null,
}: ProfileContentHeaderProps) {
  const router = useRouter();
  const categoriesLine = useMemo(() => {
    if (!bioCategoryVisibility || !hasVisibleBioCategory(bioCategoryVisibility)) {
      return "";
    }
    return formatProfileCategoriesLine(metadata, bioCategoryVisibility);
  }, [bioCategoryVisibility, metadata]);
  const hasBioText = bio.trim().length > 0;
  const hasCategoriesLine = categoriesLine.length > 0;
  const isSystemProfile = isSystemProfileUserId(userId);

  return (
    <View className="pt-4" collapsable={false}>
      <View className="relative mb-1">
        {isOwnProfile ? (
          <View
            className="absolute right-0 top-0 z-10"
            style={{
              marginRight: -(PROFILE_HORIZONTAL_PADDING - PROFILE_MENU_RIGHT_INSET),
            }}
          >
            <ProfileHeaderButton />
          </View>
        ) : (
          <View
            className="absolute left-0 right-0 top-0 z-10 flex-row items-start justify-between"
            style={{
              marginHorizontal: -PROFILE_HORIZONTAL_PADDING,
              paddingLeft: PROFILE_EDGE_INSET,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Geri"
              className="pb-2 pr-2 pt-0"
            >
              <Ionicons name="chevron-back" size={26} color="#374151" />
            </Pressable>
            <View
              style={{
                marginRight: -(PROFILE_HORIZONTAL_PADDING - PROFILE_MENU_RIGHT_INSET),
              }}
            >
              <ProfileUserMenuButton userId={userId} displayName={displayName} />
            </View>
          </View>
        )}
        <View className="items-center">
          <View className="mb-2">
            <ProfileStoryAvatar
              userId={userId}
              photoURL={photoURL}
              fallbackLetter={displayName}
              size={108}
            />
          </View>
          <Text className="text-lg font-bold text-gray-900">{displayName}</Text>
          {isSystemProfile ? (
            <View className="mt-1.5">
              <SystemProfileBadge />
            </View>
          ) : null}
          {hasBioText ? (
            <Text
              className="mt-1 max-w-[280px] text-center text-sm text-gray-500"
              numberOfLines={2}
            >
              {bio.trim()}
            </Text>
          ) : null}
          {hasCategoriesLine ? (
            <Text
              className="mt-1 max-w-[280px] text-center text-sm text-gray-400"
              numberOfLines={1}
            >
              {categoriesLine}
            </Text>
          ) : null}
          <ProfileSegmentRankBadge
            userId={userId}
            metadata={metadata}
            isOwnProfile={isOwnProfile}
          />
        </View>
      </View>

      <View collapsable={false}>{scoreSlot}</View>

      {rankingsReady ? (
        <ProfileRankingsAccordion
          userId={userId}
          metadata={metadata}
          isOwnProfile={isOwnProfile}
        />
      ) : null}

      {rankingsReady && isOwnProfile ? (
        <WhileYouWereAwaySection
          userId={userId}
          displayName={displayName}
          currentUserId={currentUserId}
        />
      ) : null}
    </View>
  );
}

export const ProfileContentHeader = memo(ProfileContentHeaderInner);
