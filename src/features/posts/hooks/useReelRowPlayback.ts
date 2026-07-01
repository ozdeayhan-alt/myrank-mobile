import { useEffect, useMemo, useRef, useState } from "react";
import { useEventListener } from "expo";
import { useVideoPlayer } from "expo-video";
import type { Post } from "../types";
import {
  postHasReelVideo,
  resolveReelVideoSources,
} from "../utils/resolveReelVideoSource";
import {
  configurePreloadPlayer,
  isPlayerReady,
  REEL_ACTIVE_BUFFER_OPTIONS,
  REEL_ADJACENT_PARK_DELAY_MS,
  REEL_PRELOAD_BUFFER_OPTIONS,
  REEL_START_TOLERANCE_SEC,
  replaceWithSourceFallback,
} from "../utils/videoReelsPlayerUtils";

type ReelRowMode = "active" | "adjacent" | "idle";

type UseReelRowPlaybackOptions = {
  post: Post;
  mode: ReelRowMode;
  enabled: boolean;
};

function sourcesKey(sources: ReturnType<typeof resolveReelVideoSources>): string {
  return sources
    .map((source) => {
      if (source == null) return "";
      if (typeof source === "string") return source;
      if (typeof source === "number") return String(source);
      return `${source.contentType ?? "auto"}:${source.uri ?? ""}`;
    })
    .join("|");
}

export function useReelRowPlayback({
  post,
  mode,
  enabled,
}: UseReelRowPlaybackOptions) {
  const sources = useMemo(
    () => resolveReelVideoSources(post),
    [post.id, post.mediaURL, post.hlsURL]
  );
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;
  const sourcesFingerprint = useMemo(() => sourcesKey(sources), [sources]);
  const shouldMount = enabled && mode !== "idle" && postHasReelVideo(post);
  const initialSource = shouldMount ? (sources[0] ?? null) : null;

  const player = useVideoPlayer(initialSource, configurePreloadPlayer);

  const generationRef = useRef(0);
  const loadedFingerprintRef = useRef<string | null>(null);
  const adjacentParkedRef = useRef(false);
  const parkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const appliedModeRef = useRef<ReelRowMode | null>(null);

  const [maskingSeek, setMaskingSeek] = useState(false);

  const clearParkTimer = () => {
    if (parkTimerRef.current != null) {
      clearTimeout(parkTimerRef.current);
      parkTimerRef.current = null;
    }
  };

  const parkAdjacentPlayer = () => {
    if (modeRef.current !== "adjacent" || !shouldMount) {
      return;
    }

    clearParkTimer();
    player.currentTime = 0;
    player.pause();
    player.muted = true;
    adjacentParkedRef.current = true;
  };

  const scheduleAdjacentPark = () => {
    if (modeRef.current !== "adjacent" || adjacentParkedRef.current) {
      return;
    }

    clearParkTimer();
    parkTimerRef.current = setTimeout(() => {
      parkTimerRef.current = null;
      parkAdjacentPlayer();
    }, REEL_ADJACENT_PARK_DELAY_MS);
  };

  const beginAdjacentPreload = () => {
    if (
      adjacentParkedRef.current &&
      player.status === "readyToPlay" &&
      player.currentTime <= REEL_START_TOLERANCE_SEC
    ) {
      return;
    }

    adjacentParkedRef.current = false;
    player.bufferOptions = { ...REEL_PRELOAD_BUFFER_OPTIONS };
    player.muted = true;
    player.play();

    if (isPlayerReady(player)) {
      scheduleAdjacentPark();
    }

    appliedModeRef.current = "adjacent";
  };

  const beginActivePlayback = () => {
    clearParkTimer();

    const wasAlreadyActive =
      modeRef.current === "active" && appliedModeRef.current === "active";

    const parkedAtStart =
      adjacentParkedRef.current &&
      player.currentTime <= REEL_START_TOLERANCE_SEC;
    adjacentParkedRef.current = false;

    player.bufferOptions = { ...REEL_ACTIVE_BUFFER_OPTIONS };

    if (
      !wasAlreadyActive &&
      !parkedAtStart &&
      player.currentTime > REEL_START_TOLERANCE_SEC
    ) {
      setMaskingSeek(true);
      player.currentTime = 0;
    } else {
      setMaskingSeek(false);
    }

    player.muted = false;
    player.play();
    appliedModeRef.current = "active";
  };

  const applyPlaybackPolicy = (currentMode: ReelRowMode) => {
    if (!shouldMount) {
      return;
    }

    player.loop = true;

    if (currentMode === "active") {
      beginActivePlayback();
      return;
    }

    if (currentMode === "adjacent") {
      beginAdjacentPreload();
    }
  };

  useEffect(() => {
    return () => {
      clearParkTimer();
    };
  }, []);

  useEffect(() => {
    if (!shouldMount) {
      clearParkTimer();
      adjacentParkedRef.current = false;
      appliedModeRef.current = null;
      setMaskingSeek(false);
      player.pause();
      player.muted = true;
      loadedFingerprintRef.current = null;
      return;
    }

    if (
      loadedFingerprintRef.current === sourcesFingerprint &&
      isPlayerReady(player)
    ) {
      return;
    }

    const generation = ++generationRef.current;

    void (async () => {
      const loaded = await replaceWithSourceFallback(
        player,
        sourcesRef.current
      );
      if (generation !== generationRef.current) {
        return;
      }

      if (loaded == null) {
        loadedFingerprintRef.current = null;
        player.pause();
        return;
      }

      loadedFingerprintRef.current = sourcesFingerprint;
      applyPlaybackPolicy(modeRef.current);
    })();

    return () => {
      generationRef.current += 1;
    };
  }, [shouldMount, sourcesFingerprint, player]);

  useEffect(() => {
    if (!enabled || !shouldMount) {
      return;
    }

    if (
      loadedFingerprintRef.current === sourcesFingerprint &&
      isPlayerReady(player)
    ) {
      if (mode === appliedModeRef.current) {
        return;
      }
      applyPlaybackPolicy(mode);
    }
  }, [enabled, mode, shouldMount, sourcesFingerprint, player]);

  useEffect(() => {
    if (!enabled || mode === "idle") {
      clearParkTimer();
      adjacentParkedRef.current = false;
      appliedModeRef.current = null;
      setMaskingSeek(false);
      player.pause();
      player.muted = true;
    }
  }, [enabled, mode, player]);

  useEffect(() => {
    player.timeUpdateEventInterval =
      shouldMount && mode === "active" && maskingSeek ? 0.05 : 0;
  }, [shouldMount, mode, maskingSeek, player]);

  useEventListener(player, "statusChange", ({ status }) => {
    if (!enabled || !shouldMount) {
      return;
    }

    if (modeRef.current === "adjacent" && status === "readyToPlay") {
      scheduleAdjacentPark();
      return;
    }

    if (modeRef.current === "active" && status === "readyToPlay") {
      player.muted = false;
      player.play();
    }
  });

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    if (
      modeRef.current === "active" &&
      maskingSeek &&
      currentTime <= REEL_START_TOLERANCE_SEC
    ) {
      setMaskingSeek(false);
    }
  });

  const showPoster =
    shouldMount && mode === "active" && (!isPlayerReady(player) || maskingSeek);

  return {
    player,
    showPoster,
    /** Android: yalnızca aktif satırda native VideoView (yüzey çakışmasını önler). */
    shouldRenderVideo: shouldMount && mode === "active",
    shouldPreload: shouldMount,
  };
}
