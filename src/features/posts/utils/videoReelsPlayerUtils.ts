import type { VideoPlayer, VideoSource } from "expo-video";
import { devWarn } from "@/lib/devLog";

export const REEL_BUFFER_OPTIONS = {
  preferredForwardBufferDuration: 5,
  minBufferForPlayback: 0.35,
  waitsToMinimizeStalling: false,
} as const;

export const SOURCE_READY_TIMEOUT_MS = 12_000;

export function configureActivePlayer(player: VideoPlayer) {
  player.loop = true;
  player.muted = false;
  player.bufferOptions = { ...REEL_BUFFER_OPTIONS };
}

export function configurePreloadPlayer(player: VideoPlayer) {
  player.loop = true;
  player.muted = true;
  player.bufferOptions = { ...REEL_BUFFER_OPTIONS };
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
        SOURCE_READY_TIMEOUT_MS
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
