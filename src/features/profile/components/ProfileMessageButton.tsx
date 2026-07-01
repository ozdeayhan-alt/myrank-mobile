import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { openConversation } from "@/features/messages/api/openConversation";
import { INSTAGRAM_SIDE_BUTTON } from "./profileInstagramSideButtonStyles";
import { ProfileInstagramSideButton } from "./ProfileInstagramSideButton";
import { useProfileVoteActions } from "./ProfileVoteProvider";

type ProfileMessageButtonProps = {
  height?: number;
  maxWidth?: number;
  fontSize?: number;
  voteDiameter?: number;
};

export function ProfileMessageButton({
  height = 54,
  maxWidth = 100,
  fontSize = 12,
  voteDiameter,
}: ProfileMessageButtonProps) {
  const router = useRouter();
  const { targetUserId, isOwnProfile, votesEnabled } = useProfileVoteActions();
  const [submitting, setSubmitting] = useState(false);

  const label = useMemo(
    () => (isOwnProfile ? "Mesajlarım" : "Mesaj"),
    [isOwnProfile]
  );

  const handlePress = useCallback(async () => {
    if (!votesEnabled || submitting) return;

    if (isOwnProfile) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push("/messages");
      return;
    }

    setSubmitting(true);
    try {
      const result = await openConversation(targetUserId);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: "/messages/[conversationId]",
        params: {
          conversationId: result.conversationId,
          title: result.otherUser.displayName,
          photoURL: result.otherUser.photoURL ?? "",
        },
      });
    } catch (error) {
      Alert.alert("Mesaj", getUserFacingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [votesEnabled, submitting, isOwnProfile, targetUserId, router]);

  const disabled = !votesEnabled || submitting;
  const accessibilityLabel = isOwnProfile ? "Mesajlarım" : "Mesaj gönder";

  return (
    <ProfileInstagramSideButton
      label={label}
      onPress={() => void handlePress()}
      disabled={disabled}
      loading={submitting}
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
  );
}
