import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { fetchFollowStatus } from "@/features/profile/api/fetchFollowStatus";
import { followUser } from "@/features/profile/api/followUser";
import {
  FOLLOW_THEMES,
  INSTAGRAM_ACTION_BLUE,
} from "@/features/profile/components/profileFollowButtonTheme";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { FEED_HEADER_BLOCK_HEIGHT } from "./postFeedHeaderLayout";

type PostFollowPlusButtonProps = {
  targetUserId: string;
  /** `ghost` = transparent over video; default matches feed score pill. */
  variant?: "default" | "ghost";
};

/** Compact follow CTA; feed pill or transparent Flow overlay. */
export function PostFollowPlusButton({
  targetUserId,
  variant = "default",
}: PostFollowPlusButtonProps) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
  }, [targetUserId]);

  const handlePress = useCallback(async () => {
    if (loading || submitting || following) {
      return;
    }

    setSubmitting(true);
    setFollowing(true);

    try {
      await followUser(targetUserId);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      setFollowing(false);
      Alert.alert("Hata", getUserFacingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [following, loading, submitting, targetUserId]);

  if (loading || (following && !submitting)) {
    return null;
  }

  const isGhost = variant === "ghost";
  const idleTheme = FOLLOW_THEMES.idle;
  const spinnerColor = isGhost ? "#FFFFFF" : idleTheme.foreground;

  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation();
        void handlePress();
      }}
      disabled={submitting}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Takip et"
      style={[
        isGhost ? styles.ghostPill : styles.pill,
        { opacity: submitting ? 0.6 : 1 },
      ]}
    >
      {submitting ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={isGhost ? styles.ghostLabel : styles.label}>Takip et</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: FEED_HEADER_BLOCK_HEIGHT,
    minWidth: FEED_HEADER_BLOCK_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: FOLLOW_THEMES.idle.borderWidth ?? 1.5,
    borderColor: FOLLOW_THEMES.idle.borderColor ?? INSTAGRAM_ACTION_BLUE,
    backgroundColor: FOLLOW_THEMES.idle.fill,
    paddingHorizontal: 10,
  } as ViewStyle,
  label: {
    color: FOLLOW_THEMES.idle.foreground,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
  } as TextStyle,
  ghostPill: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  } as ViewStyle,
  ghostLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  } as TextStyle,
});
