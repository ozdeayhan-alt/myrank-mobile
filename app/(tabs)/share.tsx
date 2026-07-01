import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { ShareComposer } from "@/features/posts/components/ShareComposer";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import {
  CONTENT_TYPE_LABELS,
  SHARE_HUB_SUBTITLES,
} from "@/features/posts/constants/contentTypeLabels";
import { useTabBarContentInset } from "@/hooks/useTabBarContentInset";
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
    title: CONTENT_TYPE_LABELS.tweet,
    subtitle: SHARE_HUB_SUBTITLES.tweet,
    icon: "chatbubble-outline",
  },
  {
    type: "image",
    title: CONTENT_TYPE_LABELS.image,
    subtitle: SHARE_HUB_SUBTITLES.image,
    icon: "image-outline",
  },
  {
    type: "video",
    title: CONTENT_TYPE_LABELS.video,
    subtitle: SHARE_HUB_SUBTITLES.video,
    icon: "videocam-outline",
  },
];

function HubOptionCard({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm active:bg-gray-50"
      onPress={onPress}
    >
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        <Ionicons name={icon} size={24} color="#111827" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
        <Text className="mt-0.5 text-sm text-gray-500">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export default function ShareScreen() {
  const router = useRouter();
  const { bottom: tabBarInset } = useTabBarContentInset();
  const [fullScreenType, setFullScreenType] = useState<PostContentType | null>(
    null
  );
  const bumpFeed = useFeedRefreshStore((s) => s.bump);

  const openCompose = (type: PostContentType) => {
    setFullScreenType(type);
  };

  const closeCompose = () => {
    setFullScreenType(null);
  };

  if (fullScreenType) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <View
          className="flex-1 px-5 pt-2"
          style={{ flex: 1, paddingBottom: tabBarInset + 8 }}
        >
          <ShareComposer
            key={fullScreenType}
            initialType={fullScreenType}
            showTypePicker={false}
            onClose={closeCompose}
            onCreated={bumpFeed}
          />
        </View>
      </TabScreenSafeArea>
    );
  }

  return (
    <TabScreenSafeArea className="flex-1 bg-gray-50">
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: tabBarInset + 8,
        }}
      >
        <View>
          <Text className="mb-1 text-2xl font-bold text-gray-900">Paylaş</Text>
          <Text className="text-sm text-gray-500">
            İçerik türünü seç; puan kazanmaya başla.
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View style={{ gap: 12 }}>
            {HUB_OPTIONS.map(({ type, title, subtitle, icon }) => (
              <HubOptionCard
                key={type}
                title={title}
                subtitle={subtitle}
                icon={icon}
                onPress={() => openCompose(type)}
              />
            ))}
            <HubOptionCard
              title="Story"
              subtitle="Fotoğraf veya video — 24 saat görünür"
              icon="ellipse-outline"
              onPress={() => router.push("/stories/create")}
            />
          </View>
        </View>
      </View>
    </TabScreenSafeArea>
  );
}
