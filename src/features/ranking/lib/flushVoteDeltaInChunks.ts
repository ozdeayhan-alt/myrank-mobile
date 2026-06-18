import { chunkVoteDelta } from "./chunkVoteDelta";

/** Send vote delta as sequential API chunks; throws on first chunk failure. */
export async function flushVoteDeltaInChunks<T>(
  delta: number,
  sendChunk: (chunk: number) => Promise<T>
): Promise<T | null> {
  const chunks = chunkVoteDelta(delta);
  if (chunks.length === 0) {
    return null;
  }

  let lastResult: T | null = null;
  for (const chunk of chunks) {
    lastResult = await sendChunk(chunk);
  }
  return lastResult;
}
