import { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDuelSession } from "../hooks/useDuelSession";
import { useDuelPrefetchStore } from "../store/useDuelPrefetchStore";
import { DuelParticipantPanel } from "./DuelParticipantPanel";
import { DuelWinnerOverlay } from "./DuelWinnerOverlay";

export function DuelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const readyMatch = useDuelPrefetchStore((s) => s.readyMatch);
  const consumeReady = useDuelPrefetchStore((s) => s.consumeReady);
  const prefetch = useDuelPrefetchStore((s) => s.prefetch);
  const startedMatchIdRef = useRef<string | null>(null);

  const match = readyMatch;
  const session = useDuelSession(match);

  useEffect(() => {
    if (match) {
      return;
    }
    void prefetch();
  }, [match, prefetch]);

  useEffect(() => {
    if (!match) {
      return;
    }
    if (startedMatchIdRef.current === match.matchId) {
      return;
    }
    startedMatchIdRef.current = match.matchId;
    session.start();
  }, [match?.matchId, session.start]);

  useEffect(() => {
    if (session.phase !== "finished") {
      return;
    }

    const timer = setTimeout(() => {
      consumeReady();
      router.back();
    }, 2200);

    return () => clearTimeout(timer);
  }, [session.phase, consumeReady, router]);

  const handleClose = useCallback(() => {
    if (session.phase === "active") {
      void session.finish({ silent: true });
    }
    consumeReady();
    router.back();
  }, [consumeReady, router, session]);

  const voteAreaHeight = Math.max(
    120,
    (screenHeight - insets.top - insets.bottom - 56) / 2
  );

  if (!match) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="mt-3 text-sm text-gray-500">Düello hazırlanıyor…</Text>
        <Pressable onPress={handleClose} className="mt-6 px-4 py-2">
          <Text className="text-sm text-gray-400">İptal</Text>
        </Pressable>
      </View>
    );
  }

  const votingEnabled = session.phase === "active";
  const showOpponentA = session.userNetB > session.userNetA;
  const showOpponentB = session.userNetA >= session.userNetB;

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="h-14 flex-row items-center justify-between px-4">
        <Text className="text-lg font-bold text-gray-900">🔥 Düello</Text>
        <View className="min-w-[48px] items-center rounded-full bg-orange-50 px-3 py-1">
          <Text className="text-2xl font-black tabular-nums text-orange-600">
            {session.secondsLeft}
          </Text>
        </View>
        <Pressable
          onPress={handleClose}
          hitSlop={12}
          accessibilityLabel="Düellodan çık"
        >
          <Text className="text-sm font-medium text-gray-400">Kapat</Text>
        </Pressable>
      </View>

      <View className="flex-1">
        <View style={{ height: voteAreaHeight }}>
          <DuelParticipantPanel
            post={match.postA}
            flex={1}
            onUp={session.registerUpA}
            onDown={session.registerDownA}
            disabled={!votingEnabled}
            opponentScore={session.opponentScores.scoreA}
            showOpponentBadge={showOpponentA}
          />
        </View>
        <View
          className="items-center justify-center bg-white py-1"
          style={{ height: 28 }}
        >
          <Text className="text-xs font-semibold uppercase tracking-widest text-gray-300">
            vs
          </Text>
        </View>
        <View style={{ height: voteAreaHeight }}>
          <DuelParticipantPanel
            post={match.postB}
            flex={1}
            onUp={session.registerUpB}
            onDown={session.registerDownB}
            disabled={!votingEnabled}
            opponentScore={session.opponentScores.scoreB}
            showOpponentBadge={showOpponentB}
          />
        </View>
      </View>

      {session.phase === "finished" && session.winner ? (
        <DuelWinnerOverlay
          winner={session.winner}
          postA={match.postA}
          postB={match.postB}
        />
      ) : null}
    </View>
  );
}
