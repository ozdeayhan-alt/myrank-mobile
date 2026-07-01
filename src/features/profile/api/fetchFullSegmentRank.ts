import { ensureRankingEntriesIfNeeded } from "./ensureRankingEntriesIfNeeded";
import { resolveOfficialSegmentRank } from "./resolveOfficialSegmentRank";
import { buildSegmentKey, type UserMetadata } from "../types";

export async function fetchFullSegmentRank(
  userId: string,
  metadata: UserMetadata,
  isOwnProfile: boolean
): Promise<number | null> {
  if (isOwnProfile) {
    await ensureRankingEntriesIfNeeded().catch(() => undefined);
  }

  const segmentKey = buildSegmentKey(metadata);
  const result = await resolveOfficialSegmentRank(segmentKey, userId);
  return result.rank;
}
