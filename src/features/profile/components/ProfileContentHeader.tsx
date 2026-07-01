import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo, useCallback, useMemo, useRef } from "react";
import { Pressable, Text, View, type View as RNView } from "react-native";
import { ProfileHeaderButton } from "@/components/ProfileHeaderButton";
import { ProfileUserMenuButton } from "@/features/blocks";
import { WhileYouWereAwaySection } from "@/features/notifications";
import type { UserMetadata } from "../types";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";
import { hasVisibleBioCategory } from "../utils/bioCategoryVisibility";
import { formatProfileCategoriesLine } from "../utils/formatProfileCategoriesLine";
import {
  PROFILE_AVATAR_SIZE,
  PROFILE_EDGE_INSET,
  PROFILE_HORIZONTAL_PADDING,
  PROFILE_MEDAL_GAP,
  PROFILE_MENU_RIGHT_INSET,
} from "../profileLayout";
import { isSystemProfileUserId } from "@/lib/profile/isSystemProfile";
import { ProfileStoryAvatar } from "@/features/stories/components/ProfileStoryAvatar";
import { ProfileRankMedal } from "./ProfileRankMedal";
import { ProfileRankingsAccordion } from "./ProfileRankingsAccordion";
import { ProfileSegmentScoreBadge } from "./ProfileSegmentScoreBadge";
import { ProfileVoteButtons } from "./ProfileVoteButtons";
import { AchievementBadge } from "./AchievementBadge";
import { useProfileTopRanking } from "../hooks/useProfileTopRanking";
import { useProfileVoteFountain } from "./profileVoteFountainContext";

type ProfileContentHeaderProps = {
  userId: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  bioCategoryVisibility?: BioCategoryVisibility;
  metadata: UserMetadata;
  isOwnProfile: boolean;
  rankingsReady: boolean;
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
  currentUserId = null,
}: ProfileContentHeaderProps) {
  const router = useRouter();
  const { patchFountainAnchor } = useProfileVoteFountain();
  const headerRef = useRef<RNView>(null);
  const avatarRef = useRef<RNView>(null);
  const voteRowRef = useRef<RNView>(null);

  const measureFountainAnchor = useCallback(() => {
    const avatarNode = avatarRef.current;
    const voteRowNode = voteRowRef.current;
    const headerNode = headerRef.current;

    if (!avatarNode || !voteRowNode || !headerNode) {
      return;
    }

    avatarNode.measureInWindow((avatarX, avatarY) => {
      voteRowNode.measureInWindow((_, voteRowY) => {
        headerNode.measureInWindow((_, __, headerWidth) => {
          if (headerWidth <= 0 || voteRowY <= 0 || avatarY <= 0) {
            return;
          }

          patchFountainAnchor({
            avatarWindowX: avatarX,
            avatarWindowY: avatarY,
            avatarSize: PROFILE_AVATAR_SIZE,
            contentWidth: headerWidth,
            voteRowWindowY: voteRowY,
          });
        });
      });
    });
  }, [patchFountainAnchor]);

  const categoriesLine = useMemo(() => {
    if (!bioCategoryVisibility || !hasVisibleBioCategory(bioCategoryVisibility)) {
      return "";
    }
    return formatProfileCategoriesLine(metadata, bioCategoryVisibility);
  }, [bioCategoryVisibility, metadata]);
  const hasBioText = bio.trim().length > 0;
  const hasCategoriesLine = categoriesLine.length > 0;
  const isSystemProfile = isSystemProfileUserId(userId);
  const topRanking = useProfileTopRanking(
    userId,
    metadata,
    rankingsReady && !isSystemProfile
  );

  return (
    <View className="pt-4" collapsable={false}>
      <View
        ref={headerRef}
        className="relative mb-1"
        style={{ overflow: "visible", zIndex: 1 }}
        onLayout={measureFountainAnchor}
        collapsable={false}
      >
        {isOwnProfile ? (
          <View
            className="absolute left-0 right-0 top-0 z-10 flex-row justify-end"
            style={{
              marginHorizontal: -PROFILE_HORIZONTAL_PADDING,
              paddingRight: PROFILE_MENU_RIGHT_INSET,
              overflow: "visible",
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
              paddingRight: PROFILE_MENU_RIGHT_INSET,
              overflow: "visible",
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
            <ProfileUserMenuButton userId={userId} displayName={displayName} />
          </View>
        )}
        <View className="items-center">
          <View
            ref={avatarRef}
            onLayout={measureFountainAnchor}
            style={{
              alignSelf: "center",
              width: PROFILE_AVATAR_SIZE,
              marginBottom: 14,
              position: "relative",
              overflow: "visible",
            }}
            collapsable={false}
          >
            <ProfileStoryAvatar
              userId={userId}
              photoURL={photoURL}
              fallbackLetter={displayName}
              size={PROFILE_AVATAR_SIZE}
              isOwnProfile={isOwnProfile}
            />
            <View
              style={{
                position: "absolute",
                left: PROFILE_AVATAR_SIZE + PROFILE_MEDAL_GAP,
                bottom: 0,
              }}
            >
              <ProfileRankMedal
                userId={userId}
                metadata={metadata}
                isOwnProfile={isOwnProfile}
              />
            </View>
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
          {topRanking ? (
            <View className="mb-1 mt-2">
              <AchievementBadge topRanking={topRanking} />
            </View>
          ) : null}
          <ProfileSegmentScoreBadge
            userId={userId}
            metadata={metadata}
            rankingsReady={rankingsReady}
          />
          <ProfileVoteButtons voteRowRef={voteRowRef} onVoteRowLayout={measureFountainAnchor} />
        </View>
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
          displayName={displayName}
          currentUserId={currentUserId}
        />
      ) : null}
    </View>
  );
}

export const ProfileContentHeader = memo(ProfileContentHeaderInner);
