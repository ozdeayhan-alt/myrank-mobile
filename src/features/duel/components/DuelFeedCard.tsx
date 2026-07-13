import { memo, useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useDuelCardPrefetch } from "../hooks/useDuelPrefetch";
import { formatDuelVoteCountLabel } from "../lib/formatDuelVoteCount";
import { useDuelPrefetchStore } from "../store/useDuelPrefetchStore";
import { DuelEntryButton } from "./DuelEntryButton";
import { DuelGoldBorderFrame } from "./DuelGoldBorderFrame";
import { DuelVsArena } from "./DuelVsArena";

type DuelFeedCardProps = {
  cardKey: string;
  visible?: boolean;
};

function DuelFeedCardInner({ cardKey, visible = false }: DuelFeedCardProps) {
  const router = useRouter();
  const { ready, isFetching, match } = useDuelCardPrefetch(cardKey, visible);
  const prefetchForCard = useDuelPrefetchStore((s) => s.prefetchForCard);

  useEffect(() => {
    if (visible && !ready && !isFetching) {
      void prefetchForCard(cardKey);
    }
  }, [cardKey, visible, ready, isFetching, prefetchForCard]);

  const voteLabel = match ? formatDuelVoteCountLabel(match) : "Hazırlanıyor…";

  const handleJoin = () => {
    if (!match) {
      return;
    }
    router.push({
      pathname: "/duel",
      params: { cardKey },
    });
  };

  return (
    <DuelGoldBorderFrame animate={visible} testID={`duel-card-${cardKey}`}>
      <DuelVsArena
        postA={match?.postA ?? null}
        postB={match?.postB ?? null}
        showParticipantDetails
        rankingsEnabled={visible}
      />

      <View className="px-4 pb-4 pt-3">
        <Text className="text-center text-sm text-gray-600">{voteLabel}</Text>

        <View className="mt-3">
          <DuelEntryButton
            label="Başlamak için dokun"
            onPress={handleJoin}
            disabled={!ready}
            accessibilityLabel="Düelloya başlamak için dokun"
            testID={`duel-join-${cardKey}`}
          />
        </View>

        {!ready && isFetching ? (
          <Text className="mt-2 text-center text-xs text-gray-400">
            Hazırlanıyor…
          </Text>
        ) : null}
      </View>
    </DuelGoldBorderFrame>
  );
}

export const DuelFeedCard = memo(DuelFeedCardInner);
