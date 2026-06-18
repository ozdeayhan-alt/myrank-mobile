import type { VideoPlayer, VideoSource } from "expo-video";
import { devWarn } from "@/lib/devLog";
import { sourceReadyTimeoutMs } from "./videoSourceTiming";

export const REEL_ACTIVE_BUFFER_OPTIONS = {
  preferredForwardBufferDuration: 5,
  minBufferForPlayback: 0.2,
  waitsToMinimizeStalling: true,
} as const;

export const REEL_PRELOAD_BUFFER_OPTIONS = {
  preferredForwardBufferDuration: 4,
  minBufferForPlayback: 0.15,
  waitsToMinimizeStalling: true,
} as const;

/** Muted preload play time before parking at t=0 (keeps buffer warm). */
export const REEL_ADJACENT_PARK_DELAY_MS = 250;

/** Active playback is considered "at start" within this tolerance (seconds). */
export const REEL_START_TOLERANCE_SEC = 0.08;

/** @deprecated Use REEL_ACTIVE_BUFFER_OPTIONS */
export const REEL_BUFFER_OPTIONS = REEL_ACTIVE_BUFFER_OPTIONS;

export function configureActivePlayer(player: VideoPlayer) {
  player.loop = true;
  player.muted = false;
  player.bufferOptions = { ...REEL_ACTIVE_BUFFER_OPTIONS };
}

export function configurePreloadPlayer(player: VideoPlayer) {
  player.loop = true;
  player.muted = true;
  player.bufferOptions = { ...REEL_PRELOAD_BUFFER_OPTIONS };
}

export function isPlayerReady(player: VideoPlayer): boolean {
  return player.status === "readyToPlay" || player.playing;
}

export function waitForPlayerReady(
  player: VideoPlayer,
  timeoutMs: number
): Promise<boolean> {
  if (player.status === "readyToPlay") {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeoutMs);
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") {
        clearTimeout(timer);
        sub.remove();
        resolve(true);
      } else if (status === "error") {
        clearTimeout(timer);
        sub.remove();
        resolve(false);
      }
    });
  });
}

export async function replaceWithSourceFallback(
  player: VideoPlayer,
  sources: VideoSource[]
): Promise<VideoSource | null> {
  for (const source of sources) {
    try {
      await player.replaceAsync(source);
      const ready = await waitForPlayerReady(
        player,
        sourceReadyTimeoutMs(source)
      );
      if (ready || player.status === "readyToPlay") {
        return source;
      }
    } catch (error) {
      devWarn("[VideoReelsViewer] source failed, trying next:", error);
    }
  }
  return null;
}
