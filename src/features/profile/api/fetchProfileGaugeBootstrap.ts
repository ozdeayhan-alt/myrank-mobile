import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { RankingLadderResult } from "@/features/profile/api/fetchRankingLadder";
import type { CategoryRanking } from "@/features/profile/api/fetchProfileRankings";

export type ProfileGaugeBootstrapResult = {
  rankings: CategoryRanking[];
  ladderSegmentKey: string;
  ladderSnapshot: RankingLadderResult;
  ladderSnapshotsBySegmentKey?: Record<string, RankingLadderResult>;
};

type ProfileGaugeBootstrapResponse = ProfileGaugeBootstrapResult & {
  ok: boolean;
  error?: string;
};

export async function fetchProfileGaugeBootstrap(
  userId: string
): Promise<ProfileGaugeBootstrapResult> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/gauge-bootstrap`,
    {
      method: "GET",
      timeoutMs: 20_000,
    }
  );

  const data = (await response.json()) as ProfileGaugeBootstrapResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Profile gauge bootstrap request failed");
  }

  return {
    rankings: data.rankings ?? [],
    ladderSegmentKey: data.ladderSegmentKey ?? "global",
    ladderSnapshot: data.ladderSnapshot,
    ladderSnapshotsBySegmentKey: data.ladderSnapshotsBySegmentKey,
  };
}
