import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export type OfficialSegmentRankResult = {
  rank: number | null;
};

type RankingEntryApiResponse = {
  ok: boolean;
  entry: { rank: number | null } | null;
  error?: string;
};

/**
 * Backend ranking entry — totalScore gün içi güncellenir; rank gece/incremental job ile yenilenir.
 */
export async function resolveOfficialSegmentRank(
  segmentKey: string,
  userId: string
): Promise<OfficialSegmentRankResult> {
  const params = new URLSearchParams({ segmentKey });
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/ranking-entry?${params.toString()}`,
    { method: "GET", timeoutMs: 15_000 }
  );

  const data = (await response.json()) as RankingEntryApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Ranking entry request failed");
  }

  const rank =
    data.entry && typeof data.entry.rank === "number" ? data.entry.rank : null;
  return { rank };
}
