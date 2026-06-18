/** Matches server MAX_PROFILE_VOTE_DELTA / MAX_POST_VOTE_DELTA. */
export const VOTE_FLUSH_CHUNK_SIZE = 200;

/** Split pending delta into sequential flush chunks (max |chunk| = chunkSize). */
export function chunkVoteDelta(
  delta: number,
  chunkSize: number = VOTE_FLUSH_CHUNK_SIZE
): number[] {
  if (delta === 0 || !Number.isFinite(delta)) {
    return [];
  }

  const size = Math.max(1, Math.floor(chunkSize));
  const chunks: number[] = [];
  let remaining = Math.trunc(delta);
  const sign = remaining > 0 ? 1 : -1;

  while (remaining !== 0) {
    const abs = Math.abs(remaining);
    const chunk = Math.min(abs, size) * sign;
    chunks.push(chunk);
    remaining -= chunk;
  }

  return chunks;
}
