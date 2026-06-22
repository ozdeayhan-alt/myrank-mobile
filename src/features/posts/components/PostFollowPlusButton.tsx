import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable } from "react-native";
import { FollowPlusIcon } from "@/features/profile/components/FollowPlusIcon";
import { fetchFollowStatus } from "@/features/profile/api/fetchFollowStatus";
import { followUser } from "@/features/profile/api/followUser";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

const ICON_SIZE = 14;
const BUTTON_SIZE = 28;

type PostFollowPlusButtonProps = {
  targetUserId: string;
};

export function PostFollowPlusButton({ targetUserId }: PostFollowPlusButtonProps) {
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
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Takip et"
      className="items-center justify-center rounded-full border border-gray-300 bg-gray-50"
      style={{
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        opacity: submitting ? 0.6 : 1,
      }}
    >
      {submitting ? (
        <ActivityIndicator size="small" color="#374151" />
      ) : (
        <FollowPlusIcon size={ICON_SIZE} color="#374151" />
      )}
    </Pressable>
  );
}
