import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { openConversation } from "@/features/messages/api/openConversation";
import { MESSAGE_BUTTON_THEME } from "@/features/messages/theme";
import { useProfileVoteContext } from "./ProfileVoteProvider";

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

type ProfileMessageButtonProps = {
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
      fontSize: size >= 74 ? 10 : 9,
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: 0.15,
      textAlign: "center",
      alignSelf: "center",
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
}

export function ProfileMessageButton({
  diameter = 76,
}: ProfileMessageButtonProps) {
  const router = useRouter();
  const { targetUserId, isOwnProfile, votesEnabled } = useProfileVoteContext();
  const [submitting, setSubmitting] = useState(false);

  const styles = useMemo(() => createStyles(diameter), [diameter]);
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
      <View
        style={[styles.dropShadow, { backgroundColor: theme.dropShadow }]}
      />

      <LinearGradient
        colors={[...MESSAGE_BUTTON_THEME.gradient]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.face, { borderColor: theme.rim }]}
      >
        <View style={styles.gloss} />
        <View style={styles.innerRim} />

        <View style={styles.content}>
          <View style={styles.iconCenter} pointerEvents="none">
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="chatbubble-ellipses"
                size={iconSize}
                color="#FFFFFF"
              />
            )}
          </View>
          {!submitting ? (
            <Text
              style={[
                styles.label,
                isOwnProfile ? { fontSize: diameter >= 74 ? 8 : 7 } : null,
              ]}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
