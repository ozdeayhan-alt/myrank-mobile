import { memo, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useDuelCardPrefetch } from "../hooks/useDuelPrefetch";
import { useDuelPrefetchStore } from "../store/useDuelPrefetchStore";

type DuelFeedCardProps = {
  cardKey: string;
  visible?: boolean;
};

function DuelFeedCardInner({ cardKey, visible = false }: DuelFeedCardProps) {
  const router = useRouter();
  const { ready } = useDuelCardPrefetch(visible);
  const prefetch = useDuelPrefetchStore((s) => s.prefetch);

  useEffect(() => {
    if (visible && !ready) {
      void prefetch();
    }
  }, [visible, ready, prefetch]);

  const handleJoin = () => {
    router.push("/duel");
  };

  return (
    <View
      className="mb-4 overflow-hidden rounded-2xl"
      style={{
        borderWidth: 1,
        borderColor: "#FED7AA",
        backgroundColor: "#FFF7ED",
      }}
      accessibilityLabel="Düello kartı"
    >
      <View className="px-4 py-5">
        <Text className="text-xs font-semibold uppercase tracking-wider text-orange-500">
          🔥 Düello
        </Text>
        <Text className="mt-1 text-lg font-bold text-gray-900">
          Kazananı sen belirle.
        </Text>
        <Text className="mt-1 text-sm text-gray-600">
          İki Glow karşı karşıya — 9 saniyede oylarını kullan.
        </Text>
        <Pressable
          onPress={handleJoin}
          className="mt-4 items-center rounded-xl bg-orange-500 py-3 active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Düelloya katıl"
          testID={`duel-join-${cardKey}`}
        >
          <Text className="text-base font-semibold text-white">
            Düelloya Katıl
          </Text>
        </Pressable>
        {!ready ? (
          <Text className="mt-2 text-center text-xs text-gray-400">
            Hazırlanıyor…
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const DuelFeedCard = memo(DuelFeedCardInner);
