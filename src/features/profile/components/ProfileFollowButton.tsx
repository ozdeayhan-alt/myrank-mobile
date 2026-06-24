import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { fetchFollowStatus } from "../api/fetchFollowStatus";
import { followUser } from "../api/followUser";
import { unfollowUser } from "../api/unfollowUser";
import { FollowPlusIcon } from "./FollowPlusIcon";
import { FOLLOW_THEMES } from "./profileFollowButtonTheme";
import { createProfileFollowButtonStyles } from "./profileFollowButtonStyles";
import { useProfileVoteContext } from "./ProfileVoteProvider";

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

type ProfileFollowButtonProps = {
  diameter?: number;
};

export function ProfileFollowButton({ diameter = 76 }: ProfileFollowButtonProps) {
  const { targetUserId, isOwnProfile, votesEnabled } = useProfileVoteContext();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const styles = useMemo(() => createProfileFollowButtonStyles(diameter), [diameter]);
  const theme = FOLLOW_THEMES[following ? "active" : "idle"];
  const label = following ? "Takiptesin" : "Takip Et";
  const iconSize = Math.round(diameter * 0.34);

  useEffect(() => {
    if (isOwnProfile || !votesEnabled) {
      setLoading(false);
      setFollowing(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchFollowStatus(targetUserId)
      .then((status) => {
        if (!cancelled) {
          setFollowing(status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFollowing(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [targetUserId, isOwnProfile, votesEnabled]);

  const handlePress = useCallback(async () => {
    if (!votesEnabled || submitting || loading) {
      return;
    }

    const nextFollowing = !following;
    setSubmitting(true);
    setFollowing(nextFollowing);

    try {
      if (nextFollowing) {
        await followUser(targetUserId);
      } else {
        await unfollowUser(targetUserId);
      }
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      setFollowing(following);
      Alert.alert("Hata", getUserFacingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [votesEnabled, submitting, loading, following, targetUserId]);

  if (isOwnProfile) {
    return null;
  }

  const disabled = !votesEnabled || loading || submitting;
  const accessibilityLabel = following ? "Takipten çık" : "Takip et";

  return (
    <Pressable
      onPress={() => void handlePress()}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
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
        style={[
          styles.face,
          {
            backgroundColor: theme.fill,
            borderColor: theme.borderColor ?? "transparent",
            borderWidth: theme.borderWidth ?? 0,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.iconCenter} pointerEvents="none">
            {loading || submitting ? (
              <ActivityIndicator size="small" color={theme.foreground} />
            ) : (
              <FollowPlusIcon size={iconSize} color={theme.foreground} />
            )}
          </View>
          {!loading && !submitting ? (
            <Text style={[styles.label, { color: theme.foreground }]}>
              {label}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
