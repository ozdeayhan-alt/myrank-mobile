import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { fetchFollowStatus } from "../api/fetchFollowStatus";
import { followUser } from "../api/followUser";
import { unfollowUser } from "../api/unfollowUser";
import { FOLLOW_THEMES } from "./profileFollowButtonTheme";
import { ProfileInstagramSideButton } from "./ProfileInstagramSideButton";
import { useProfileVoteActions } from "./ProfileVoteProvider";

type ProfileFollowButtonProps = {
  height?: number;
  maxWidth?: number;
  fontSize?: number;
  voteDiameter?: number;
};

export function ProfileFollowButton({
  height = 54,
  maxWidth = 100,
  fontSize = 12,
  voteDiameter,
}: ProfileFollowButtonProps) {
  const { targetUserId, isOwnProfile, votesEnabled } = useProfileVoteActions();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const theme = FOLLOW_THEMES[following ? "active" : "idle"];
  const label = following ? "Takiptesin" : "Takip Et";

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

  const accessibilityLabel = useMemo(
    () => (following ? "Takipten çık" : "Takip et"),
    [following]
  );

  if (isOwnProfile) {
    return null;
  }

  const disabled = !votesEnabled || loading || submitting;

  return (
    <ProfileInstagramSideButton
      label={label}
      onPress={() => void handlePress()}
      disabled={disabled}
      loading={loading || submitting}
      accessibilityLabel={accessibilityLabel}
      height={height}
      maxWidth={maxWidth}
      fontSize={fontSize}
      voteDiameter={voteDiameter}
      fill={theme.fill}
      foreground={theme.foreground}
      borderColor={theme.borderColor}
      borderWidth={theme.borderWidth}
    />
  );
}
