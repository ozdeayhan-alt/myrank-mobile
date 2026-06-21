import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import {
  ACTION_CHIPS,
  CAPTION_MAX_LENGTH,
  createAiStory,
  LOCATION_CHIPS,
  MOOD_CHIPS,
  StoryChipPicker,
} from "@/features/ai-story";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export default function CreateAiStoryScreen() {
  const router = useRouter();
  const [moodKey, setMoodKey] = useState<string | null>(null);
  const [locationKey, setLocationKey] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = moodKey && locationKey && actionKey && !submitting;

  const handleCreate = async () => {
    if (!moodKey || !locationKey || !actionKey) {
      Alert.alert("Eksik seçim", "Mood, konum ve aksiyon seçmelisin.");
      return;
    }

    setSubmitting(true);
    try {
      const story = await createAiStory({
        moodKey,
        locationKey,
        actionKey,
        caption: caption.trim() || null,
      });
      router.replace({
        pathname: "/ai-story/view",
        params: { storyId: story.id },
      });
    } catch (error) {
      Alert.alert("Story oluşturulamadı", getUserFacingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TabScreenSafeArea className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-1 text-2xl font-bold text-gray-900">
          Vibe Story
        </Text>
        <Text className="mb-6 text-sm text-gray-500">
          Chip seç, istersen kısa bir caption ekle. 24 saat görünür.
        </Text>

        <StoryChipPicker
          label="Nasıl hissediyorsun?"
          chips={MOOD_CHIPS}
          selectedKey={moodKey}
          onSelect={setMoodKey}
        />
        <StoryChipPicker
          label="Neredesin?"
          chips={LOCATION_CHIPS}
          selectedKey={locationKey}
          onSelect={setLocationKey}
        />
        <StoryChipPicker
          label="Ne yapıyorsun?"
          chips={ACTION_CHIPS}
          selectedKey={actionKey}
          onSelect={setActionKey}
        />

        <Text className="mb-2 text-sm font-semibold text-gray-700">
          Opsiyonel caption
        </Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          maxLength={CAPTION_MAX_LENGTH}
          placeholder="Kısa bir not..."
          className="mb-2 rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900"
        />
        <Text className="mb-6 text-xs text-gray-400">
          {caption.length}/{CAPTION_MAX_LENGTH}
        </Text>

        <Pressable
          disabled={!canSubmit}
          onPress={handleCreate}
          className={`mb-8 items-center rounded-xl py-4 ${
            canSubmit ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              Story Oluştur
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </TabScreenSafeArea>
  );
}
