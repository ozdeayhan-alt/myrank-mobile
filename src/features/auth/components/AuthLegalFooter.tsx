import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

type AuthLegalFooterProps = {
  className?: string;
};

export function AuthLegalFooter({ className = "mt-8" }: AuthLegalFooterProps) {
  const router = useRouter();

  return (
    <View className={`items-center ${className}`}>
      <View className="flex-row flex-wrap items-center justify-center gap-x-1">
        <Pressable onPress={() => router.push("/legal/privacy")}>
          <Text className="text-xs font-medium text-gray-600">
            Gizlilik Politikası
          </Text>
        </Pressable>
        <Text className="text-xs text-gray-400">·</Text>
        <Pressable onPress={() => router.push("/legal/terms")}>
          <Text className="text-xs font-medium text-gray-600">
            Kullanım Koşulları
          </Text>
        </Pressable>
        <Text className="text-xs text-gray-400">·</Text>
        <Pressable onPress={() => router.push("/legal/moderation")}>
          <Text className="text-xs font-medium text-gray-600">Moderasyon</Text>
        </Pressable>
      </View>
    </View>
  );
}
