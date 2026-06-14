import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fetchFollowCounts } from "../api/fetchFollowCounts";
import { FollowListsSheet } from "./FollowListsSheet";
import { useProfileVoteContext } from "./ProfileVoteProvider";
import type { FollowCounts } from "../types/followLists";

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

const STATS_THEME = {
  gradient: ["#4ade80", "#16a34a", "#14532d"] as const,
  rim: "#15803d",
  dropShadow: "#052e16",
};

type ProfileFollowStatsButtonProps = {
  diameter?: number;
};

function createStyles(size: number) {
  return StyleSheet.create({
    wrapper: {
      width: size,
      height: size + 6,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    dropShadow: {
      position: "absolute",
      bottom: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: 0.35,
    },
    face: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2.5,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 6,
      elevation: 5,
    },
    content: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: Math.max(6, Math.round(size * 0.1)),
    },
    iconCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 6,
    },
    gloss: {
      position: "absolute",
      top: 4,
      left: size * 0.14,
      right: size * 0.14,
      height: size * 0.36,
      borderBottomLeftRadius: size,
      borderBottomRightRadius: size,
      backgroundColor: "rgba(255,255,255,0.16)",
    },
    innerRim: {
      position: "absolute",
      bottom: 6,
      left: size * 0.18,
      right: size * 0.18,
      height: 2,
      borderRadius: 2,
      backgroundColor: "rgba(0,0,0,0.12)",
    },
    label: {
      fontSize: size >= 74 ? 9 : 8,
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: 0.1,
      textAlign: "center",
      alignSelf: "center",
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
}

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

  const styles = useMemo(() => createStyles(diameter), [diameter]);
  const iconSize = Math.round(diameter * 0.34);
  const countLabel = `${counts.followingCount} · ${counts.followersCount}`;

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
        <View
          style={[styles.dropShadow, { backgroundColor: STATS_THEME.dropShadow }]}
        />

        <LinearGradient
          colors={[...STATS_THEME.gradient]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.face, { borderColor: STATS_THEME.rim }]}
        >
          <View style={styles.gloss} />
          <View style={styles.innerRim} />

          <View style={styles.content}>
            <View style={styles.iconCenter} pointerEvents="none">
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="people" size={iconSize} color="#FFFFFF" />
              )}
            </View>
            {!loading ? (
              <Text style={styles.label}>{countLabel}</Text>
            ) : null}
          </View>
        </LinearGradient>
      </Pressable>

      <FollowListsSheet
        visible={sheetVisible}
        counts={counts}
        onClose={handleCloseSheet}
      />
    </>
  );
}
