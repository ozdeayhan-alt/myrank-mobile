import { Ionicons } from "@expo/vector-icons";
import { memo, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import type { Post } from "@/features/posts/types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "@/features/posts/utils/resolvePostAuthor";
import type { DuelMatch, DuelWinnerSide } from "../types";
import { DuelEntryButton } from "./DuelEntryButton";
import { DuelVsArena } from "./DuelVsArena";
import { DuelWinnerGlowFrame } from "./DuelWinnerGlowFrame";

const NEXT_ARENA_WIDTH = 272;
const NEXT_ARENA_HEIGHT = 112;

type DuelResultScreenProps = {
  winner: DuelWinnerSide;
  winnerUpCount: number;
  postA: Post;
  postB: Post;
  currentMatchId: string;
  nextMatch: DuelMatch | null;
  nextPrefetching: boolean;
  flushError: string | null;
  nextLoading: boolean;
  onNextDuel: () => void;
  onClose: () => void;
};

function resolveWinningPost(
  winner: DuelWinnerSide,
  postA: Post,
  postB: Post
): Post | null {
  if (winner === "a") return postA;
  if (winner === "b") return postB;
  return null;
}

function DuelResultScreenInner({
  winner,
  winnerUpCount,
  postA,
  postB,
  currentMatchId,
  nextMatch,
  nextPrefetching,
  flushError,
  nextLoading,
  onNextDuel,
  onClose,
}: DuelResultScreenProps) {
  const insets = useSafeAreaInsets();
  const winningPost = resolveWinningPost(winner, postA, postB);
  const isTie = winner === "tie";

  const displayName = winningPost
    ? resolvePostAuthorDisplayName(winningPost)
    : null;
  const photoURL = winningPost ? resolvePostAuthorPhotoURL(winningPost) : "";
  const initial = winningPost ? resolvePostAuthorInitial(winningPost) : "?";

  const { fullUri, previewUri } = useMemo(() => {
    if (!winningPost) {
      return { fullUri: null, previewUri: null };
    }
    return resolveFeedMediaDisplayUrls(winningPost);
  }, [winningPost]);
  const imageUri = fullUri ?? previewUri;

  const previewMatch =
    nextMatch && nextMatch.matchId !== currentMatchId ? nextMatch : null;

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      className="flex-1 bg-white"
    >
      {!isTie && winningPost ? (
        <View className="border-b border-gray-200 bg-white px-3 py-2.5">
          <View className="flex-row items-center gap-2">
            <ProfileAvatar
              photoURL={photoURL}
              fallbackLetter={initial}
              size={32}
            />
            <Text
              className="flex-1 text-sm font-semibold text-gray-900"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="min-h-0 flex-[0.5] bg-gray-50 px-4 pb-2 pt-3">
        {isTie ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-lg font-bold text-gray-900">
              Berabere
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-500">
              İki Glow da eşit güçte.
            </Text>
          </View>
        ) : winningPost && imageUri ? (
          <DuelWinnerGlowFrame
            uri={imageUri}
            recyclingKey={`duel-winner-${winningPost.id}`}
          />
        ) : null}
      </View>

      <View className="flex-1 items-center px-6 pt-4">
        {!isTie && displayName ? (
          <Animated.Text
            entering={FadeInDown.delay(120).duration(400)}
            className="text-center text-base font-semibold text-gray-900"
          >
            Bu düelloyu {displayName}&apos;e {winnerUpCount} yükseltle sen
            kazandırdın.
          </Animated.Text>
        ) : isTie ? (
          <Animated.Text
            entering={FadeInDown.delay(120).duration(400)}
            className="text-center text-base font-semibold text-gray-900"
          >
            Bu düello berabere bitti.
          </Animated.Text>
        ) : null}

        <Animated.Text
          entering={FadeInDown.delay(180).duration(350)}
          className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-500"
        >
          Sıradaki Düello
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(220).duration(350)}
          className="mt-3"
        >
          {previewMatch ? (
            <DuelVsArena
              postA={previewMatch.postA}
              postB={previewMatch.postB}
              arenaSize={NEXT_ARENA_WIDTH}
              arenaHeight={NEXT_ARENA_HEIGHT}
              rankingsEnabled
            />
          ) : (
            <View
              className="items-center justify-center rounded-xl border border-gray-200 bg-gray-50"
              style={{
                width: NEXT_ARENA_WIDTH,
                minHeight: NEXT_ARENA_HEIGHT + 36,
              }}
            >
              {nextPrefetching ? (
                <ActivityIndicator color="#9CA3AF" />
              ) : (
                <Text className="text-xs text-gray-400">Hazırlanıyor…</Text>
              )}
            </View>
          )}
        </Animated.View>

        {flushError ? (
          <Text className="mt-3 text-center text-sm text-red-600">
            {flushError}
          </Text>
        ) : null}

        <Animated.View
          entering={FadeInDown.delay(280).duration(350)}
          className="mt-5 w-full"
        >
          {nextLoading ? (
            <View className="items-center py-3">
              <ActivityIndicator color="#FF2800" />
            </View>
          ) : (
            <DuelEntryButton
              label="Sonraki Düello"
              tone="red"
              onPress={onNextDuel}
              accessibilityLabel="Sonraki düello"
            />
          )}
        </Animated.View>

        <View className="flex-1" />

        <Pressable
          onPress={onClose}
          hitSlop={16}
          className="items-center justify-center self-center"
          style={{
            width: 44,
            height: 44,
            marginBottom: Math.max(insets.bottom, 12),
          }}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
        >
          <Ionicons name="close" size={28} color="#9CA3AF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export const DuelResultScreen = memo(DuelResultScreenInner);
