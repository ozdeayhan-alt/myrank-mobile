import * as Speech from "expo-speech";

const CHUNK_PAUSE_MS = 400;

export type GossipSpeechOptions = {
  language?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function speakOnce(text: string, options: GossipSpeechOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: options.language ?? "tr-TR",
      voice: options.voice,
      rate: options.rate,
      pitch: options.pitch,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: (error) => reject(error),
    });
  });
}

/** Speaks each part with a short pause; returns false if cancelled. */
export async function speakGossipChunks(
  parts: string[],
  options: GossipSpeechOptions,
  isCancelled: () => boolean
): Promise<void> {
  const chunks = parts.map((part) => part.trim()).filter(Boolean);

  for (let index = 0; index < chunks.length; index += 1) {
    if (isCancelled()) return;

    await speakOnce(chunks[index], options);

    if (isCancelled()) return;

    if (index < chunks.length - 1) {
      await delay(CHUNK_PAUSE_MS);
    }
  }
}
