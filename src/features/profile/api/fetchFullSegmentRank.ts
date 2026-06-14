import { ensureRankingEntries } from "./ensureRankingEntries";
import { resolveOfficialSegmentRank } from "./resolveOfficialSegmentRank";
import { buildSegmentKey, type UserMetadata } from "../types";

export async function fetchFullSegmentRank(
  userId: string,
  metadata: UserMetadata,
  isOwnProfile: boolean
): Promise<number | null> {
  if (isOwnProfile) {
    await ensureRankingEntries().catch(() => undefined);
  }

  const segmentKey = buildSegmentKey(metadata);
  const result = await resolveOfficialSegmentRank(segmentKey, userId);
  return result.rank;
}
