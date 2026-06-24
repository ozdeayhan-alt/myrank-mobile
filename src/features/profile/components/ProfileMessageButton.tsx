import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { openConversation } from "@/features/messages/api/openConversation";
import { MESSAGE_BUTTON_THEME } from "@/features/messages/theme";
import { createProfileFollowButtonStyles } from "./profileFollowButtonStyles";
import { useProfileVoteContext } from "./ProfileVoteProvider";

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

type ProfileMessageButtonProps = {
  diameter?: number;
};

export function ProfileMessageButton({
  diameter = 76,
}: ProfileMessageButtonProps) {
  const router = useRouter();
  const { targetUserId, isOwnProfile, votesEnabled } = useProfileVoteContext();
  const [submitting, setSubmitting] = useState(false);

  const styles = useMemo(() => createProfileFollowButtonStyles(diameter), [diameter]);
  const theme = MESSAGE_BUTTON_THEME;
  const iconSize = Math.round(diameter * 0.34);
  const label = isOwnProfile ? "Mesajlarım" : "Mesaj";

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
      <View style={[styles.face, { backgroundColor: theme.fill }]}>
        <View style={styles.content}>
          <View style={styles.iconCenter} pointerEvents="none">
            {submitting ? (
              <ActivityIndicator size="small" color={theme.foreground} />
            ) : (
              <Ionicons
                name="chatbubble-ellipses"
                size={iconSize}
                color={theme.foreground}
              />
            )}
          </View>
          {!submitting ? (
            <Text
              style={[
                styles.label,
                { color: theme.foreground },
                isOwnProfile ? { fontSize: diameter >= 74 ? 8 : 7 } : null,
              ]}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
