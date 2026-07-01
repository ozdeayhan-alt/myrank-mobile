import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import { fetchStoryInsights } from "../api/fetchStoryInsights";
import type { StoryActorSummary, StoryInsights } from "../constants/types";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { SPINNER_COLOR } from "@/lib/uiClasses";

type StoryInsightsSheetProps = {
  visible: boolean;
  storyId: string | null;
  onClose: () => void;
};

export function StoryInsightsSheet({
  visible,
  storyId,
  onClose,
}: StoryInsightsSheetProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<StoryInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !storyId) {
      setInsights(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    void fetchStoryInsights(storyId)
      .then(setInsights)
      .catch((err) => {
        setError(getUserFacingErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [storyId, visible]);

  const handleUserPress = useCallback(
    (entry: StoryActorSummary) => {
      onClose();
      navigateToAuthorProfile(entry.userId, user?.uid, {
        displayName: entry.displayName,
        photoURL: entry.photoURL ?? undefined,
      });
    },
    [onClose, user?.uid]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <SafeAreaView
          edges={["bottom"]}
          className="overflow-hidden rounded-t-3xl bg-white"
          style={{ maxHeight: "72%" }}
        >
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <Text className="text-lg font-bold text-gray-900">
              Görüntüleyenler
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {loading ? (
            <View className="min-h-[320px] items-center justify-center">
              <ActivityIndicator color={SPINNER_COLOR} size="large" />
            </View>
          ) : error ? (
            <View className="min-h-[200px] items-center justify-center px-6">
              <Text className="text-center text-sm text-gray-500">{error}</Text>
            </View>
          ) : insights ? (
            <View className="min-h-[320px]">
              <View className="items-center border-b border-gray-100 px-4 py-4">
                <Text className="text-2xl font-bold text-gray-900">
                  {insights.viewCount}
                </Text>
                <Text className="mt-1 text-xs font-semibold text-gray-500">
                  görüntüleme
                </Text>
              </View>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                {insights.viewers.length === 0 ? (
                  <View className="px-3 py-8">
                    <Text className="text-center text-sm text-gray-500">
                      Henüz görüntüleyen yok.
                    </Text>
                  </View>
                ) : (
                  insights.viewers.map((entry) => (
                    <Pressable
                      key={entry.userId}
                      onPress={() => handleUserPress(entry)}
                      className="flex-row items-center px-4 py-2.5"
                      accessibilityRole="button"
                      accessibilityLabel={entry.displayName}
                    >
                      <ProfileAvatar
                        size={40}
                        photoURL={entry.photoURL ?? ""}
                        fallbackLetter={entry.displayName.slice(0, 1).toUpperCase()}
                      />
                      <Text
                        className="ml-2.5 flex-1 text-sm font-semibold text-gray-900"
                        numberOfLines={1}
                      >
                        {entry.displayName}
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
