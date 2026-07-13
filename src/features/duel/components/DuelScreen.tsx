import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DUEL_ROUND_TRANSITION_MS, DUEL_SCREEN_FADE_MS } from "../constants";
import { useDuelSession } from "../hooks/useDuelSession";
import { useDuelPrefetchStore } from "../store/useDuelPrefetchStore";
import type { DuelMatch } from "../types";
import { DuelFullScreenRound } from "./DuelParticipantPanel";
import { DuelResultScreen } from "./DuelResultScreen";

export function DuelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cardKey } = useLocalSearchParams<{ cardKey?: string }>();
  const resolvedCardKey =
    typeof cardKey === "string" && cardKey.length > 0 ? cardKey : null;

  const sessionReadyMatch = useDuelPrefetchStore((s) => s.sessionReadyMatch);
  const isSessionPrefetching = useDuelPrefetchStore((s) => s.sessionFetching);
  const consumeCardMatch = useDuelPrefetchStore((s) => s.consumeCardMatch);
  const consumeSessionReady = useDuelPrefetchStore((s) => s.consumeSessionReady);
  const prefetchSessionMatch = useDuelPrefetchStore((s) => s.prefetchSessionMatch);

  const [match, setMatch] = useState<DuelMatch | null>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const session = useDuelSession(match);

  useEffect(() => {
    if (bootstrapped) {
      return;
    }

    let initial: DuelMatch | null = null;
    if (resolvedCardKey) {
      initial = consumeCardMatch(resolvedCardKey);
    }
    if (!initial) {
      initial = consumeSessionReady();
    }

    setMatch(initial);
    setBootstrapped(true);
  }, [bootstrapped, consumeCardMatch, consumeSessionReady, resolvedCardKey]);

  useEffect(() => {
    if (!bootstrapped || match) {
      return;
    }
    void (async () => {
      await prefetchSessionMatch();
      const ready = consumeSessionReady();
      if (ready) {
        setMatch(ready);
      }
    })();
  }, [bootstrapped, consumeSessionReady, match, prefetchSessionMatch]);

  useEffect(() => {
    if (!match) {
      return;
    }
    session.start();
  }, [match?.matchId, session.start]);

  useEffect(() => {
    if (!match || session.phase !== "finished") {
      return;
    }
    void prefetchSessionMatch([match.postA.id, match.postB.id]);
  }, [match?.matchId, session.phase, prefetchSessionMatch]);

  const handleClose = useCallback(() => {
    if (session.phase === "round_a" || session.phase === "round_b") {
      void session.finish({ silent: true });
    }
    router.back();
  }, [router, session]);

  const handleNextDuel = useCallback(async () => {
    setNextLoading(true);
    try {
      session.reset();

      let nextMatch = consumeSessionReady();
      if (!nextMatch) {
        await prefetchSessionMatch(
          match ? [match.postA.id, match.postB.id] : []
        );
        nextMatch = consumeSessionReady();
      }
      if (nextMatch) {
        setMatch(nextMatch);
        session.start();
      }
    } finally {
      setNextLoading(false);
    }
  }, [consumeSessionReady, match, prefetchSessionMatch, session]);

  const votingEnabled =
    session.phase === "round_a" || session.phase === "round_b";

  if (!match) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color="#374151" />
        <Text className="mt-3 text-sm text-gray-500">Düello hazırlanıyor…</Text>
        <Pressable onPress={handleClose} className="mt-6 px-4 py-2">
          <Text className="text-sm text-gray-400">İptal</Text>
        </Pressable>
      </View>
    );
  }

  if (session.phase === "finished" && session.winner) {
    return (
      <View
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <DuelResultScreen
          winner={session.winner}
          winnerUpCount={session.winnerUpCount}
          postA={match.postA}
          postB={match.postB}
          currentMatchId={match.matchId}
          nextMatch={sessionReadyMatch}
          nextPrefetching={isSessionPrefetching}
          flushError={session.flushError}
          nextLoading={nextLoading}
          onNextDuel={handleNextDuel}
          onClose={handleClose}
        />
      </View>
    );
  }

  const activePost =
    session.phase === "round_b" ? match.postB : match.postA;
  const onUp =
    session.phase === "round_b"
      ? session.registerUpB
      : session.registerUpA;
  const onDown =
    session.phase === "round_b"
      ? session.registerDownB
      : session.registerDownA;
  const sessionNet =
    session.phase === "round_b" ? session.userNetB : session.userNetA;

  return (
    <View className="flex-1 bg-white">
      {session.phase === "transition" ? (
        <Animated.View
          entering={FadeIn.duration(DUEL_ROUND_TRANSITION_MS)}
          exiting={FadeOut.duration(DUEL_ROUND_TRANSITION_MS)}
          className="flex-1 items-center justify-center bg-white"
        >
          <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Sıradaki
          </Text>
        </Animated.View>
      ) : (
        <Animated.View
          key={`${match.matchId}-${session.phase}`}
          entering={FadeIn.duration(
            session.phase === "round_a" ? DUEL_SCREEN_FADE_MS : DUEL_ROUND_TRANSITION_MS
          )}
          exiting={FadeOut.duration(DUEL_ROUND_TRANSITION_MS)}
          className="flex-1"
        >
          <DuelFullScreenRound
            post={activePost}
            secondsLeft={session.secondsLeft}
            sessionNet={sessionNet}
            onUp={onUp}
            onDown={onDown}
            onSwipeToNext={session.skipToNextRound}
            votingEnabled={votingEnabled}
          />
        </Animated.View>
      )}
    </View>
  );
}
