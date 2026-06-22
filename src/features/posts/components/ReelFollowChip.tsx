import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text } from "react-native";
import { fetchFollowStatus } from "@/features/profile/api/fetchFollowStatus";
import { followUser } from "@/features/profile/api/followUser";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

type ReelFollowChipProps = {
  targetUserId: string;
};

export function ReelFollowChip({ targetUserId }: ReelFollowChipProps) {
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
      className="ml-2 shrink-0 rounded-md border border-white/80 bg-white/15 px-2.5 py-1"
      style={{ opacity: submitting ? 0.6 : 1 }}
    >
      {submitting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className="text-xs font-semibold text-white">Takip Et</Text>
      )}
    </Pressable>
  );
}
