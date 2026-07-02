import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

export type PlayerSlotId = "A" | "B" | "C";

export type PlayerSlotMode = "active" | "adjacent" | "idle";

type SlotAssignment = {
  slotId: PlayerSlotId;
  post: Post;
  mode: PlayerSlotMode;
};

type PlayerPoolContextValue = {
  getAssignment: (index: number) => SlotAssignment | null;
  getPlayer: (slotId: PlayerSlotId) => VideoPlayer;
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

function PooledPlayer({
  slotId,
  assignment,
  enabled,
  playersRef,
  loadedRef,
  failedRef,
  maskingRef,
}: {
  slotId: PlayerSlotId;
  assignment: SlotAssignment | null;
  enabled: boolean;
  playersRef: React.MutableRefObject<Record<PlayerSlotId, VideoPlayer>>;
  loadedRef: React.MutableRefObject<Record<PlayerSlotId, string | null>>;
  failedRef: React.MutableRefObject<Record<PlayerSlotId, boolean>>;
  maskingRef: React.MutableRefObject<Record<PlayerSlotId, boolean>>;
}) {
  const shouldMount =
    enabled &&
    assignment != null &&
    assignment.mode !== "idle" &&
    postHasReelVideo(assignment.post);

  const initialSource = shouldMount
    ? (resolveReelVideoSources(assignment.post)[0] ?? null)
    : null;

  const player = useVideoPlayer(initialSource, configurePreloadPlayer);
  playersRef.current[slotId] = player;

  const mode = assignment?.mode ?? "idle";
  const post = assignment?.post;
  const generationRef = useRef(0);
  const parkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearParkTimer = useCallback(() => {
    if (parkTimerRef.current != null) {
      clearTimeout(parkTimerRef.current);
      parkTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearParkTimer();
    };
  }, [clearParkTimer]);

  useEffect(() => {
    if (!shouldMount || !post) {
      clearParkTimer();
      player.pause();
      player.muted = true;
      loadedRef.current[slotId] = null;
      failedRef.current[slotId] = false;
      maskingRef.current[slotId] = false;
      return;
    }

    const fingerprint = sourcesFingerprint(post);
    if (loadedRef.current[slotId] === fingerprint && isPlayerReady(player)) {
      applyModePolicy(player, mode, clearParkTimer, parkTimerRef);
      return;
    }

    failedRef.current[slotId] = false;
    const generation = ++generationRef.current;

    void (async () => {
      const loaded = await replaceWithSourceFallback(
        player,
        resolveReelVideoSources(post)
      );
      if (generation !== generationRef.current) {
        return;
      }
      if (loaded == null) {
        loadedRef.current[slotId] = null;
        failedRef.current[slotId] = true;
        player.pause();
        player.muted = true;
        return;
      }
      loadedRef.current[slotId] = fingerprint;
      applyModePolicy(player, mode, clearParkTimer, parkTimerRef);
    })();

    return () => {
      generationRef.current += 1;
    };
  }, [shouldMount, post?.id, post?.mediaURL, post?.hlsURL, mode, player, slotId, clearParkTimer, failedRef, loadedRef, maskingRef]);

  useEventListener(player, "statusChange", ({ status }) => {
    if (!shouldMount || mode === "idle") {
      return;
    }
    if (mode === "adjacent" && status === "readyToPlay") {
      clearParkTimer();
      parkTimerRef.current = setTimeout(() => {
        player.currentTime = 0;
        player.pause();
        player.muted = true;
      }, REEL_ADJACENT_PARK_DELAY_MS);
    }
    if (mode === "active" && status === "readyToPlay") {
      player.muted = false;
      player.play();
    }
  });

  return null;
}

function applyModePolicy(
  player: VideoPlayer,
  mode: PlayerSlotMode,
  clearParkTimer: () => void,
  parkTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
) {
  player.loop = true;
  if (mode === "active") {
    clearParkTimer();
    configureActivePlayer(player);
    player.play();
    return;
  }
  if (mode === "adjacent") {
    configurePreloadPlayer(player);
    player.muted = true;
    player.play();
    clearParkTimer();
    parkTimerRef.current = setTimeout(() => {
      player.currentTime = 0;
      player.pause();
      player.muted = true;
    }, REEL_ADJACENT_PARK_DELAY_MS);
    return;
  }
  player.pause();
  player.muted = true;
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
  const playersRef = useRef<Record<PlayerSlotId, VideoPlayer>>({} as Record<
    PlayerSlotId,
    VideoPlayer
  >);
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

  const value = useMemo<PlayerPoolContextValue>(
    () => ({
      getAssignment: (index) => slotByIndex.get(index) ?? null,
      getPlayer: (slotId) => playersRef.current[slotId],
      showPoster: (index) => {
        const assignment = slotByIndex.get(index);
        if (!assignment || assignment.mode !== "active") {
          return false;
        }
        const slotId = assignment.slotId;
        return (
          failedRef.current[slotId] ||
          !isPlayerReady(playersRef.current[slotId]) ||
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
        return assignment?.mode === "active";
      },
    }),
    [slotByIndex]
  );

  return (
    <PlayerPoolContext.Provider value={value}>
      {SLOT_IDS.map((slotId) => {
        const assignment =
          [...assignments.values()].find((a) => a.slotId === slotId) ?? null;
        return (
          <PooledPlayer
            key={slotId}
            slotId={slotId}
            assignment={assignment}
            enabled={enabled}
            playersRef={playersRef}
            loadedRef={loadedRef}
            failedRef={failedRef}
            maskingRef={maskingRef}
          />
        );
      })}
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
