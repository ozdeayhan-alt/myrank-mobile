import { memo } from "react";
import { Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import type { DuelWinnerSide } from "../types";
import type { Post } from "@/features/posts/types";
import {
  resolvePostAuthorDisplayName,
} from "@/features/posts/utils/resolvePostAuthor";

type DuelWinnerOverlayProps = {
  winner: DuelWinnerSide;
  postA: Post;
  postB: Post;
};

function resolveWinnerLabel(
  winner: DuelWinnerSide,
  postA: Post,
  postB: Post
): { title: string; subtitle: string } {
  if (winner === "tie") {
    return {
      title: "Berabere!",
      subtitle: "İki Glow da eşit güçte.",
    };
  }

  const winningPost = winner === "a" ? postA : postB;
  const name = resolvePostAuthorDisplayName(winningPost);

  return {
    title: "Kazanan",
    subtitle: name,
  };
}

function DuelWinnerOverlayInner({
  winner,
  postA,
  postB,
}: DuelWinnerOverlayProps) {
  const { title, subtitle } = resolveWinnerLabel(winner, postA, postB);

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      className="absolute inset-0 items-center justify-center px-8"
      style={{ backgroundColor: "rgba(255,255,255,0.94)" }}
    >
      <Animated.Text
        entering={ZoomIn.duration(420)}
        className="text-sm font-semibold uppercase tracking-widest text-orange-500"
      >
        {title}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(120).duration(400)}
        className="mt-3 text-center text-3xl font-bold text-gray-900"
      >
        {subtitle}
      </Animated.Text>
      <Animated.View entering={FadeInDown.delay(260).duration(350)}>
        <Text className="mt-4 text-center text-base text-gray-500">
          Oyların kaydedildi. Ana akışa dönülüyor…
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export const DuelWinnerOverlay = memo(DuelWinnerOverlayInner);
