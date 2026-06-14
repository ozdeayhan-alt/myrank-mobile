import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import { useEventListener } from "expo";
import { useVideoPlayer } from "expo-video";
import { devWarn } from "@/lib/devLog";
import type { Post } from "../types";
import {
  postHasReelVideo,
  resolveReelVideoSource,
  resolveReelVideoSources,
} from "../utils/resolveReelVideoSource";
import {
  configureActivePlayer,
  configurePreloadPlayer,
  replaceWithSourceFallback,
} from "../utils/videoReelsPlayerUtils";

const POOL_SIZE = 3;

type PlayerSlot = 0 | 1 | 2;

type UseVideoReelsPlaybackOptions = {
  visible: boolean;
  videoPosts: Post[];
  initialIndex: number;
};

function otherSlots(active: PlayerSlot): PlayerSlot[] {
  return Array.from({ length: POOL_SIZE - 1 }, (_, index) =>
    ((active + index + 1) % POOL_SIZE) as PlayerSlot
  );
}

export function useVideoReelsPlayback({
  visible,
  videoPosts,
  initialIndex,
}: UseVideoReelsPlaybackOptions) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [activeSlot, setActiveSlot] = useState<PlayerSlot>(0);
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const lastScrollYRef = useRef(0);

  const activeSlotRef = useRef<PlayerSlot>(0);
  const loadedIndexRef = useRef<(number | null)[]>(
    Array.from({ length: POOL_SIZE }, () => null)
  );
  const preloadGenerationRef = useRef(0);
  const scrollDirectionRef = useRef<"up" | "down">("down");

  const initialSource = resolveReelVideoSource(videoPosts[initialIndex]);

  const player0 = useVideoPlayer(initialSource, configureActivePlayer);
  const player1 = useVideoPlayer(null, configurePreloadPlayer);
  const player2 = useVideoPlayer(null, configurePreloadPlayer);

  const players = useMemo(
    () => [player0, player1, player2] as const,
    [player0, player1, player2]
  );
  const activePlayer = players[activeSlot];

  const activePost = videoPosts[activeIndex];
  const activeSources = useMemo(
    () => resolveReelVideoSources(activePost),
    [activePost]
  );

  const fadeVideoIn = useCallback(() => {
    Animated.timing(videoOpacity, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start();
  }, [videoOpacity]);

  const fadeVideoOut = useCallback(() => {
    Animated.timing(videoOpacity, {
      toValue: 0,
      duration: 40,
      useNativeDriver: true,
    }).start();
  }, [videoOpacity]);

  const applyReadyFromStatus = useCallback(
    (slot: PlayerSlot, status: string) => {
      if (activeSlotRef.current !== slot) return;
      if (status === "readyToPlay") {
        fadeVideoIn();
      } else if (status === "loading" || status === "error") {
        fadeVideoOut();
      }
    },
    [fadeVideoIn, fadeVideoOut]
  );

  useEventListener(player0, "statusChange", ({ status }) => {
    applyReadyFromStatus(0, status);
  });

  useEventListener(player1, "statusChange", ({ status }) => {
    applyReadyFromStatus(1, status);
  });

  useEventListener(player2, "statusChange", ({ status }) => {
    applyReadyFromStatus(2, status);
  });

  useEventListener(player0, "playingChange", ({ isPlaying }) => {
    if (activeSlotRef.current === 0 && isPlaying) {
      fadeVideoIn();
    }
  });

  useEventListener(player1, "playingChange", ({ isPlaying }) => {
    if (activeSlotRef.current === 1 && isPlaying) {
      fadeVideoIn();
    }
  });

  useEventListener(player2, "playingChange", ({ isPlaying }) => {
    if (activeSlotRef.current === 2 && isPlaying) {
      fadeVideoIn();
    }
  });

  useEffect(() => {
    if (!visible) return;

    setActiveIndex(initialIndex);
    setActiveSlot(0);
    activeSlotRef.current = 0;
    loadedIndexRef.current = Array.from({ length: POOL_SIZE }, () => null);
    loadedIndexRef.current[0] = initialIndex;
    preloadGenerationRef.current += 1;
    videoOpacity.setValue(0);
  }, [visible, initialIndex, videoOpacity]);

  useEffect(() => {
    if (!visible) {
      player0.pause();
      player1.pause();
      player2.pause();
      return;
    }

    if (!postHasReelVideo(activePost) || activeSources.length === 0) {
      activePlayer.pause();
      fadeVideoOut();
      return;
    }

    const currentSlot = activeSlotRef.current;
    const readyAlternate = otherSlots(currentSlot).find(
      (slot) =>
        loadedIndexRef.current[slot] === activeIndex &&
        players[slot].status === "readyToPlay"
    );

    if (readyAlternate != null) {
      players[currentSlot].pause();
      players[currentSlot].muted = true;
      const incoming = players[readyAlternate];
      incoming.muted = false;
      incoming.loop = true;
      activeSlotRef.current = readyAlternate;
      setActiveSlot(readyAlternate);
      fadeVideoIn();
      incoming.play();
      return;
    }

    let cancelled = false;
    fadeVideoOut();

    void (async () => {
      const current = players[currentSlot];
      const loaded = await replaceWithSourceFallback(current, activeSources);
      if (cancelled) return;

      if (loaded == null) {
        devWarn(
          "[VideoReelsViewer] all sources failed for index",
          activeIndex
        );
        fadeVideoOut();
        return;
      }

      loadedIndexRef.current[currentSlot] = activeIndex;
      current.muted = false;
      current.loop = true;
      current.play();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    visible,
    activeIndex,
    activeSources,
    activePost,
    activePlayer,
    fadeVideoIn,
    fadeVideoOut,
    player0,
    player1,
    player2,
    players,
  ]);

  useEffect(() => {
    if (!visible) return;

    const direction = scrollDirectionRef.current;
    const preloadTargets = [
      direction === "down" ? activeIndex + 1 : activeIndex - 1,
      direction === "down" ? activeIndex + 2 : activeIndex - 2,
      direction === "down" ? activeIndex - 1 : activeIndex + 1,
    ].filter((index) => index >= 0 && index < videoPosts.length);

    if (preloadTargets.length === 0) return;

    const generation = preloadGenerationRef.current;
    const inactiveSlots = otherSlots(activeSlotRef.current);

    preloadTargets.forEach((targetIndex, targetOrder) => {
      const preloadSlot = inactiveSlots[targetOrder];
      if (preloadSlot == null) return;
      if (loadedIndexRef.current[preloadSlot] === targetIndex) return;

      const targetSources = resolveReelVideoSources(videoPosts[targetIndex]);
      if (targetSources.length === 0) return;

      const preloadPlayer = players[preloadSlot];
      preloadPlayer.muted = true;

      void (async () => {
        const loaded = await replaceWithSourceFallback(
          preloadPlayer,
          targetSources
        );
        if (generation !== preloadGenerationRef.current) return;
        if (loaded != null) {
          loadedIndexRef.current[preloadSlot] = targetIndex;
        }
      })();
    });
  }, [visible, activeIndex, activeSlot, videoPosts, players]);

  const onScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const lastOffset = lastScrollYRef.current;
      if (offsetY > lastOffset + 2) {
        scrollDirectionRef.current = "down";
      } else if (offsetY < lastOffset - 2) {
        scrollDirectionRef.current = "up";
      }
      lastScrollYRef.current = offsetY;
    },
    []
  );

  const pauseAll = useCallback(() => {
    player0.pause();
    player1.pause();
    player2.pause();
  }, [player0, player1, player2]);

  return {
    activeIndex,
    setActiveIndex,
    activePlayer,
    activePost,
    videoOpacity,
    onScroll,
    pauseAll,
    lastScrollYRef,
    scrollDirectionRef,
  };
}
