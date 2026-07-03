import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useEventListener } from "expo";
import { useVideoPlayer, type VideoPlayer } from "expo-video";
import type { Post } from "@/features/posts/types";
import {
  postHasReelVideo,
  resolveReelVideoSources,
} from "@/features/posts/utils/resolveReelVideoSource";
import {
  configureActivePlayer,
  configurePreloadPlayer,
  isPlayerReady,
  REEL_ADJACENT_PARK_DELAY_MS,
  replaceWithSourceFallback,
} from "@/features/posts/utils/videoReelsPlayerUtils";
import { devFlowLog, safePlayerStatus } from "@/lib/devLog";

export type PlayerSlotId = "A" | "B" | "C";

export type PlayerSlotMode = "active" | "adjacent" | "idle";

type SlotAssignment = {
  slotId: PlayerSlotId;
  post: Post;
  mode: PlayerSlotMode;
};

type PlayerPoolContextValue = {
  getAssignment: (index: number) => SlotAssignment | null;
  getPlayer: (slotId: PlayerSlotId) => VideoPlayer | null;
  getPlayerGeneration: (slotId: PlayerSlotId) => number;
  showPoster: (index: number) => boolean;
  loadFailed: (index: number) => boolean;
  shouldRenderVideo: (index: number) => boolean;
};

const PlayerPoolContext = createContext<PlayerPoolContextValue | null>(null);

const SLOT_IDS: PlayerSlotId[] = ["A", "B", "C"];

function sourcesFingerprint(post: Post): string {
  return resolveReelVideoSources(post)
    .map((source) => {
      if (source == null) return "";
      if (typeof source === "string") return source;
      if (typeof source === "number") return String(source);
      return `${source.contentType ?? "auto"}:${source.uri ?? ""}`;
    })
    .join("|");
}

function safeIsPlayerReady(player: VideoPlayer | null | undefined): boolean {
  if (!player) {
    return false;
  }
  try {
    return isPlayerReady(player);
  } catch {
    return false;
  }
}

function safePausePlayer(player: VideoPlayer, slotId?: PlayerSlotId, postId?: string) {
  devFlowLog("PlayerPool", "pause()", {
    postId: postId ?? null,
    slot: slotId ?? null,
    status: safePlayerStatus(player),
  });
  try {
    player.pause();
    player.muted = true;
  } catch {
    // Player already released by useVideoPlayer teardown.
  }
}

function logPlay(
  player: VideoPlayer,
  slotId: PlayerSlotId,
  postId: string | undefined,
  mode: PlayerSlotMode
) {
  devFlowLog("PlayerPool", "play()", {
    postId: postId ?? null,
    slot: slotId,
    mode,
    status: safePlayerStatus(player),
  });
}

function isBoundPlayer(
  playersRef: React.MutableRefObject<Partial<Record<PlayerSlotId, VideoPlayer>>>,
  slotId: PlayerSlotId,
  player: VideoPlayer
): boolean {
  return playersRef.current[slotId] === player;
}

function PooledPlayer({
  slotId,
  assignment,
  enabled,
  playersRef,
  playerGenerationRef,
  loadedRef,
  failedRef,
  maskingRef,
}: {
  slotId: PlayerSlotId;
  assignment: SlotAssignment | null;
  enabled: boolean;
  playersRef: React.MutableRefObject<Partial<Record<PlayerSlotId, VideoPlayer>>>;
  playerGenerationRef: React.MutableRefObject<Record<PlayerSlotId, number>>;
  loadedRef: React.MutableRefObject<Record<PlayerSlotId, string | null>>;
  failedRef: React.MutableRefObject<Record<PlayerSlotId, boolean>>;
  maskingRef: React.MutableRefObject<Record<PlayerSlotId, boolean>>;
}) {
  const shouldMount =
    enabled &&
    assignment != null &&
    assignment.mode !== "idle" &&
    postHasReelVideo(assignment.post);

  // Stable player instance per slot — source changes go through replaceAsync only.
  const player = useVideoPlayer(null, configurePreloadPlayer);

  const mode = assignment?.mode ?? "idle";
  const post = assignment?.post;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const prevModeRef = useRef<PlayerSlotMode>(mode);
  const shouldMountRef = useRef(shouldMount);
  shouldMountRef.current = shouldMount;
  const appliedModeRef = useRef<PlayerSlotMode | null>(null);
  const generationRef = useRef(0);
  const parkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearParkTimer = useCallback(() => {
    if (parkTimerRef.current != null) {
      clearTimeout(parkTimerRef.current);
      parkTimerRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    playersRef.current[slotId] = player;
    playerGenerationRef.current[slotId] += 1;
    devFlowLog("PlayerPool", "generation++", {
      postId: post?.id ?? null,
      slot: slotId,
      generation: playerGenerationRef.current[slotId],
      mode,
      status: "layout-mount",
    });

    return () => {
      clearParkTimer();
      generationRef.current += 1;
      devFlowLog("PlayerPool", "generation++", {
        postId: post?.id ?? null,
        slot: slotId,
        generation: generationRef.current,
        mode,
        status: "layout-cleanup",
      });
      safePausePlayer(player, slotId, post?.id);
      if (playersRef.current[slotId] === player) {
        delete playersRef.current[slotId];
      }
      playerGenerationRef.current[slotId] += 1;
      devFlowLog("PlayerPool", "generation++", {
        postId: post?.id ?? null,
        slot: slotId,
        generation: playerGenerationRef.current[slotId],
        mode,
        status: "playerGeneration-cleanup",
      });
    };
  }, [clearParkTimer, mode, player, playerGenerationRef, playersRef, post?.id, slotId]);

  // VideoView kalkmadan önce aktif oynatıcıyı durdur (native surface çakışmasını önler).
  useLayoutEffect(() => {
    const previousMode = prevModeRef.current;
    prevModeRef.current = mode;

    if (!isBoundPlayer(playersRef, slotId, player)) {
      return;
    }

    if (previousMode === "active" && mode !== "active") {
      clearParkTimer();
      safePausePlayer(player, slotId, post?.id);
      appliedModeRef.current = null;
    }
  }, [clearParkTimer, mode, player, playersRef, post?.id, slotId]);

  useEffect(() => {
    if (!shouldMount || !post) {
      clearParkTimer();
      if (isBoundPlayer(playersRef, slotId, player)) {
        safePausePlayer(player, slotId, post?.id);
      }
      loadedRef.current[slotId] = null;
      failedRef.current[slotId] = false;
      maskingRef.current[slotId] = false;
      appliedModeRef.current = null;
      return;
    }

    const fingerprint = sourcesFingerprint(post);
    if (loadedRef.current[slotId] === fingerprint && safeIsPlayerReady(player)) {
      if (appliedModeRef.current !== mode) {
        applyModePolicy(player, mode, clearParkTimer, parkTimerRef, {
          shouldMountRef,
          modeRef,
          playersRef,
          slotId,
          player,
          postId: post.id,
        });
        appliedModeRef.current = mode;
      }
      return;
    }

    failedRef.current[slotId] = false;
    const generation = ++generationRef.current;
    devFlowLog("PlayerPool", "replaceAsync START", {
      postId: post.id,
      slot: slotId,
      generation,
      mode,
      status: safePlayerStatus(player),
    });

    void (async () => {
      const loaded = await replaceWithSourceFallback(
        player,
        resolveReelVideoSources(post)
      );
      if (generation !== generationRef.current) {
        devFlowLog("PlayerPool", "replaceAsync CANCEL", {
          postId: post.id,
          slot: slotId,
          generation,
          mode,
          status: `stale=${generationRef.current}`,
        });
        return;
      }
      if (!isBoundPlayer(playersRef, slotId, player)) {
        devFlowLog("PlayerPool", "replaceAsync CANCEL", {
          postId: post.id,
          slot: slotId,
          generation,
          mode,
          status: "unbound",
        });
        return;
      }
      if (loaded == null) {
        loadedRef.current[slotId] = null;
        failedRef.current[slotId] = true;
        devFlowLog("PlayerPool", "replaceAsync END", {
          postId: post.id,
          slot: slotId,
          generation,
          mode,
          status: "failed",
        });
        safePausePlayer(player, slotId, post.id);
        return;
      }
      loadedRef.current[slotId] = fingerprint;
      devFlowLog("PlayerPool", "replaceAsync END", {
        postId: post.id,
        slot: slotId,
        generation,
        mode,
        status: "loaded",
      });
      applyModePolicy(player, mode, clearParkTimer, parkTimerRef, {
        shouldMountRef,
        modeRef,
        playersRef,
        slotId,
        player,
        postId: post.id,
      });
      appliedModeRef.current = mode;
    })();

    return () => {
      generationRef.current += 1;
      devFlowLog("PlayerPool", "generation++", {
        postId: post.id,
        slot: slotId,
        generation: generationRef.current,
        mode,
        status: "effect-cleanup",
      });
    };
  }, [shouldMount, post?.id, post?.mediaURL, post?.hlsURL, mode, player, slotId, clearParkTimer, failedRef, loadedRef, maskingRef, playersRef]);

  useEventListener(player, "statusChange", ({ status }) => {
    if (!shouldMountRef.current || modeRef.current === "idle") {
      return;
    }
    if (!isBoundPlayer(playersRef, slotId, player)) {
      return;
    }
    devFlowLog("PlayerPool", "statusChange", {
      postId: post?.id ?? null,
      slot: slotId,
      generation: playerGenerationRef.current[slotId],
      mode: modeRef.current,
      status,
    });
    if (modeRef.current === "adjacent" && status === "readyToPlay") {
      clearParkTimer();
      parkTimerRef.current = setTimeout(() => {
        if (!shouldMountRef.current || modeRef.current !== "adjacent") {
          return;
        }
        if (!isBoundPlayer(playersRef, slotId, player)) {
          return;
        }
        try {
          player.currentTime = 0;
          devFlowLog("PlayerPool", "pause()", {
            postId: post?.id ?? null,
            slot: slotId,
            mode: modeRef.current,
            status: "adjacent-park",
          });
          player.pause();
          player.muted = true;
        } catch {
          // released
        }
      }, REEL_ADJACENT_PARK_DELAY_MS);
    }
    if (modeRef.current === "active" && status === "readyToPlay") {
      try {
        player.muted = false;
        logPlay(player, slotId, post?.id, modeRef.current);
        player.play();
      } catch {
        // released
      }
    }
  });

  return null;
}

function applyModePolicy(
  player: VideoPlayer,
  mode: PlayerSlotMode,
  clearParkTimer: () => void,
  parkTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  guard: {
    shouldMountRef: React.MutableRefObject<boolean>;
    modeRef: React.MutableRefObject<PlayerSlotMode>;
    playersRef: React.MutableRefObject<Partial<Record<PlayerSlotId, VideoPlayer>>>;
    slotId: PlayerSlotId;
    player: VideoPlayer;
    postId?: string;
  }
) {
  if (!isBoundPlayer(guard.playersRef, guard.slotId, guard.player)) {
    return;
  }

  devFlowLog("PlayerPool", "applyModePolicy", {
    postId: guard.postId ?? null,
    slot: guard.slotId,
    mode,
    status: safePlayerStatus(player),
  });

  try {
    player.loop = true;
    if (mode === "active") {
      clearParkTimer();
      configureActivePlayer(player);
      logPlay(player, guard.slotId, guard.postId, mode);
      player.play();
      return;
    }
    if (mode === "adjacent") {
      configurePreloadPlayer(player);
      player.muted = true;
      logPlay(player, guard.slotId, guard.postId, mode);
      player.play();
      clearParkTimer();
      parkTimerRef.current = setTimeout(() => {
        if (!guard.shouldMountRef.current || guard.modeRef.current !== "adjacent") {
          return;
        }
        if (!isBoundPlayer(guard.playersRef, guard.slotId, guard.player)) {
          return;
        }
        try {
          player.currentTime = 0;
          devFlowLog("PlayerPool", "pause()", {
            postId: guard.postId ?? null,
            slot: guard.slotId,
            mode: guard.modeRef.current,
            status: "adjacent-park",
          });
          player.pause();
          player.muted = true;
        } catch {
          // released
        }
      }, REEL_ADJACENT_PARK_DELAY_MS);
      return;
    }
    devFlowLog("PlayerPool", "pause()", {
      postId: guard.postId ?? null,
      slot: guard.slotId,
      mode,
      status: "idle-policy",
    });
    player.pause();
    player.muted = true;
  } catch {
    // released
  }
}

type PlayerPoolProviderProps = {
  activeIndex: number;
  posts: Post[];
  enabled: boolean;
  children: ReactNode;
};

export function PlayerPoolProvider({
  activeIndex,
  posts,
  enabled,
  children,
}: PlayerPoolProviderProps) {
  const playersRef = useRef<Partial<Record<PlayerSlotId, VideoPlayer>>>({});
  const playerGenerationRef = useRef<Record<PlayerSlotId, number>>({
    A: 0,
    B: 0,
    C: 0,
  });
  const loadedRef = useRef<Record<PlayerSlotId, string | null>>({
    A: null,
    B: null,
    C: null,
  });
  const failedRef = useRef<Record<PlayerSlotId, boolean>>({
    A: false,
    B: false,
    C: false,
  });
  const maskingRef = useRef<Record<PlayerSlotId, boolean>>({
    A: false,
    B: false,
    C: false,
  });

  const assignments = useMemo(() => {
    const map = new Map<number, SlotAssignment>();
    if (posts.length === 0) {
      return map;
    }

    const assign = (index: number, slotId: PlayerSlotId, mode: PlayerSlotMode) => {
      if (index < 0 || index >= posts.length) {
        return;
      }
      map.set(index, { slotId, post: posts[index], mode });
    };

    assign(activeIndex, "A", "active");
    assign(activeIndex - 1, "B", "adjacent");
    assign(activeIndex + 1, "C", "adjacent");

    return map;
  }, [activeIndex, posts]);

  const slotByIndex = useMemo(() => {
    const reverse = new Map<number, SlotAssignment>();
    for (const [index, assignment] of assignments) {
      reverse.set(index, assignment);
    }
    return reverse;
  }, [assignments]);

  const assignmentBySlotId = useMemo(() => {
    const slots: Record<PlayerSlotId, SlotAssignment | null> = {
      A: null,
      B: null,
      C: null,
    };
    for (const assignment of assignments.values()) {
      slots[assignment.slotId] = assignment;
    }
    return slots;
  }, [assignments]);

  useEffect(() => {
    const summary = SLOT_IDS.map((slotId) => {
      const assignment = assignmentBySlotId[slotId];
      if (!assignment) {
        return `${slotId}=-`;
      }
      const index = posts.findIndex((post) => post.id === assignment.post.id);
      return `${slotId}@${index}:${assignment.post.id.slice(0, 8)}:${assignment.mode}`;
    }).join(" ");
    devFlowLog("PlayerPool", "assignmentMap", {
      postId: posts[activeIndex]?.id ?? null,
      activeIndex,
      status: summary,
    });
  }, [activeIndex, assignmentBySlotId, assignments, posts]);

  const value = useMemo<PlayerPoolContextValue>(
    () => ({
      getAssignment: (index) => slotByIndex.get(index) ?? null,
      getPlayer: (slotId) => playersRef.current[slotId] ?? null,
      getPlayerGeneration: (slotId) => playerGenerationRef.current[slotId] ?? 0,
      showPoster: (index) => {
        const assignment = slotByIndex.get(index);
        if (!assignment || assignment.mode !== "active") {
          return false;
        }
        const slotId = assignment.slotId;
        const player = playersRef.current[slotId];
        return (
          failedRef.current[slotId] ||
          !safeIsPlayerReady(player) ||
          maskingRef.current[slotId]
        );
      },
      loadFailed: (index) => {
        const assignment = slotByIndex.get(index);
        if (!assignment || assignment.mode !== "active") {
          return false;
        }
        return failedRef.current[assignment.slotId];
      },
      shouldRenderVideo: (index) => {
        const assignment = slotByIndex.get(index);
        if (!assignment || assignment.mode !== "active") {
          return false;
        }
        return Boolean(playersRef.current[assignment.slotId]);
      },
    }),
    [slotByIndex]
  );

  return (
    <PlayerPoolContext.Provider value={value}>
      {SLOT_IDS.map((slotId) => (
        <PooledPlayer
          key={slotId}
          slotId={slotId}
          assignment={assignmentBySlotId[slotId]}
          enabled={enabled}
          playersRef={playersRef}
          playerGenerationRef={playerGenerationRef}
          loadedRef={loadedRef}
          failedRef={failedRef}
          maskingRef={maskingRef}
        />
      ))}
      {children}
    </PlayerPoolContext.Provider>
  );
}

export function usePlayerPool(): PlayerPoolContextValue {
  const ctx = useContext(PlayerPoolContext);
  if (!ctx) {
    throw new Error("usePlayerPool must be used within PlayerPoolProvider");
  }
  return ctx;
}
