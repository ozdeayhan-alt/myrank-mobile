import { useCallback, useEffect, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { fetchFollowCounts } from "../api/fetchFollowCounts";
import { FollowListsSheet } from "./FollowListsSheet";
import { INSTAGRAM_SIDE_BUTTON } from "./profileInstagramSideButtonStyles";
import { ProfileInstagramSideButton } from "./ProfileInstagramSideButton";
import { useProfileVoteActions } from "./ProfileVoteProvider";
import type { FollowCounts } from "../types/followLists";

type ProfileFollowStatsButtonProps = {
  height?: number;
  maxWidth?: number;
  fontSize?: number;
  voteDiameter?: number;
};

const DEFAULT_COUNTS: FollowCounts = {
  followingCount: 0,
  followersCount: 0,
};

export function ProfileFollowStatsButton({
  height = 54,
  maxWidth = 100,
  fontSize = 12,
  voteDiameter,
}: ProfileFollowStatsButtonProps) {
  const { isOwnProfile, votesEnabled } = useProfileVoteActions();
  const [counts, setCounts] = useState<FollowCounts>(DEFAULT_COUNTS);
  const [loading, setLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);

  const loadCounts = useCallback(() => {
    setLoading(true);
    fetchFollowCounts()
      .then(setCounts)
      .catch(() => {
        setCounts(DEFAULT_COUNTS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isOwnProfile || !votesEnabled) {
      setLoading(false);
      return;
    }
    loadCounts();
  }, [isOwnProfile, votesEnabled, loadCounts]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
    loadCounts();
  }, [loadCounts]);

  const accessibilityLabel = useMemo(
    () =>
      `Takiplerim, ${counts.followingCount} takip edilen, ${counts.followersCount} takipçi`,
    [counts.followersCount, counts.followingCount]
  );

  if (!isOwnProfile) {
    return null;
  }

  const disabled = !votesEnabled || loading;

  return (
    <>
      <ProfileInstagramSideButton
        label="Takiplerim"
        onPress={handlePress}
        disabled={disabled}
        loading={loading}
        accessibilityLabel={accessibilityLabel}
        height={height}
        maxWidth={maxWidth}
        fontSize={fontSize}
        voteDiameter={voteDiameter}
        fill={INSTAGRAM_SIDE_BUTTON.fill}
        foreground={INSTAGRAM_SIDE_BUTTON.foreground}
        borderColor={INSTAGRAM_SIDE_BUTTON.border}
        borderWidth={1}
      />

      <FollowListsSheet
        visible={sheetVisible}
        counts={counts}
        onClose={handleCloseSheet}
      />
    </>
  );
}
