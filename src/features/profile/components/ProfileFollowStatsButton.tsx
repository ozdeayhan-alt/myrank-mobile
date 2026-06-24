import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fetchFollowCounts } from "../api/fetchFollowCounts";
import { FollowListsSheet } from "./FollowListsSheet";
import { PROFILE_SECONDARY_BUTTON_COLORS } from "./profileFollowButtonTheme";
import { createProfileFollowButtonStyles } from "./profileFollowButtonStyles";
import { useProfileVoteContext } from "./ProfileVoteProvider";
import type { FollowCounts } from "../types/followLists";

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

type ProfileFollowStatsButtonProps = {
  diameter?: number;
};

const DEFAULT_COUNTS: FollowCounts = {
  followingCount: 0,
  followersCount: 0,
};

export function ProfileFollowStatsButton({
  diameter = 76,
}: ProfileFollowStatsButtonProps) {
  const { isOwnProfile, votesEnabled } = useProfileVoteContext();
  const [counts, setCounts] = useState<FollowCounts>(DEFAULT_COUNTS);
  const [loading, setLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);

  const styles = useMemo(() => createProfileFollowButtonStyles(diameter), [diameter]);
  const iconSize = Math.round(diameter * 0.34);
  const label = "Takiplerim";
  const theme = PROFILE_SECONDARY_BUTTON_COLORS;

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

  if (!isOwnProfile) {
    return null;
  }

  const disabled = !votesEnabled || loading;

  return (
    <>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={`Takiplerim, ${counts.followingCount} takip edilen, ${counts.followersCount} takipçi`}
        style={({ pressed }) => [
          styles.wrapper,
          {
            opacity: disabled ? 0.45 : 1,
            transform: [
              { scale: pressed && !disabled ? 0.94 : 1 },
              { translateY: pressed && !disabled ? 3 : 0 },
            ],
          },
        ]}
      >
        <View style={[styles.face, { backgroundColor: theme.fill }]}>
          <View style={styles.content}>
            <View style={styles.iconCenter} pointerEvents="none">
              {loading ? (
                <ActivityIndicator size="small" color={theme.foreground} />
              ) : (
                <Ionicons name="people" size={iconSize} color={theme.foreground} />
              )}
            </View>
            {!loading ? (
              <Text
                style={[
                  styles.label,
                  { color: theme.foreground, fontSize: diameter >= 74 ? 8 : 7 },
                ]}
              >
                {label}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <FollowListsSheet
        visible={sheetVisible}
        counts={counts}
        onClose={handleCloseSheet}
      />
    </>
  );
}
