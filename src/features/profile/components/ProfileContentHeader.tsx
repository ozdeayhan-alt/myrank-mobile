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
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileRankingsAccordion } from "./ProfileRankingsAccordion";

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
  voteButtonsSlot: ReactNode;
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
  voteButtonsSlot,
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

  return (
    <View className="pt-4" collapsable={false}>
      <View className="relative mb-4">
        {isOwnProfile ? (
          <View className="absolute right-0 top-0 z-10 flex-row items-center">
            <ProfileHeaderButton />
          </View>
        ) : (
          <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Geri"
              className="p-2"
            >
              <Ionicons name="chevron-back" size={26} color="#374151" />
            </Pressable>
            <ProfileUserMenuButton userId={userId} displayName={displayName} />
          </View>
        )}
        <View className="items-center">
          <View className="mb-2">
            <ProfileAvatar
              photoURL={photoURL}
              fallbackLetter={displayName}
              size={108}
            />
          </View>
          <Text className="text-lg font-bold text-gray-900">{displayName}</Text>
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
        </View>
      </View>

      <View collapsable={false}>{scoreSlot}</View>

      <View className="mt-1" collapsable={false}>
        {voteButtonsSlot}
      </View>

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
          currentUserId={currentUserId}
        />
      ) : null}

      <Text className="mb-3 text-lg font-semibold text-gray-900">
        {isOwnProfile ? "Gönderilerim" : "Gönderiler"}
      </Text>
    </View>
  );
}

export const ProfileContentHeader = memo(ProfileContentHeaderInner);
