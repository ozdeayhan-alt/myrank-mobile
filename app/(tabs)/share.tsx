import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { ShareComposer } from "@/features/posts/components/ShareComposer";
import { ShareModal } from "@/features/posts/components/ShareModal";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import type { PostContentType } from "@/features/posts/types";

type HubOption = {
  type: PostContentType;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const HUB_OPTIONS: HubOption[] = [
  {
    type: "tweet",
    title: "Tweet",
    subtitle: "280 karaktere kadar metin paylaş",
    icon: "chatbubble-outline",
  },
  {
    type: "image",
    title: "Fotoğraf",
    subtitle: "Galeriden görsel yükle",
    icon: "image-outline",
  },
  {
    type: "video",
    title: "Video",
    subtitle: "En fazla 33 saniyelik video",
    icon: "videocam-outline",
  },
];

export default function ShareScreen() {
  const [modalOpen, setModalOpen] = useState(false);
  const [fullScreenType, setFullScreenType] = useState<PostContentType | null>(
    null
  );
  const [initialType, setInitialType] = useState<PostContentType>("tweet");
  const bumpFeed = useFeedRefreshStore((s) => s.bump);

  const openCompose = (type: PostContentType, mode: "sheet" | "screen") => {
    setInitialType(type);
    if (mode === "sheet") {
      setModalOpen(true);
    } else {
      setFullScreenType(type);
    }
  };

  const closeCompose = () => {
    setModalOpen(false);
    setFullScreenType(null);
  };

  if (fullScreenType) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <View className="flex-1 px-5 pb-6 pt-2">
          <ShareComposer
            key={fullScreenType}
            initialType={fullScreenType}
            onClose={closeCompose}
            onCreated={bumpFeed}
            variant="screen"
          />
        </View>
      </TabScreenSafeArea>
    );
  }

  return (
    <TabScreenSafeArea className="flex-1 bg-gray-50">
      <View className="flex-1 px-5 pb-8 pt-4">
        <Text className="mb-1 text-2xl font-bold text-gray-900">Paylaş</Text>
        <Text className="mb-6 text-sm text-gray-500">
          İçerik türünü seç; puan kazanmaya başla.
        </Text>

        <View className="gap-3">
          {HUB_OPTIONS.map(({ type, title, subtitle, icon }) => (
            <Pressable
              key={type}
              className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm active:bg-gray-50"
              onPress={() => openCompose(type, "screen")}
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Ionicons name={icon} size={24} color="#111827" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {title}
                </Text>
                <Text className="mt-0.5 text-sm text-gray-500">{subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>

        <Pressable
          className="mt-6 items-center rounded-2xl border border-gray-200 bg-white py-3.5"
          onPress={() => openCompose("tweet", "sheet")}
        >
          <Text className="text-sm font-medium text-gray-600">
            Hızlı paylaşım (alt panel)
          </Text>
        </Pressable>
      </View>

      <ShareModal
        visible={modalOpen}
        initialType={initialType}
        onClose={() => setModalOpen(false)}
        onCreated={bumpFeed}
      />
    </TabScreenSafeArea>
  );
}
