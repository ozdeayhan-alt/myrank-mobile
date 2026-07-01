import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import {
  buildSegmentKey,
  EMPTY_METADATA,
  type UserMetadata,
} from "../types";

export type ProfileRankingKey = keyof UserMetadata | "global";

export type CategoryRanking = {
  key: ProfileRankingKey;
  rank: number | null;
  isOfficial: boolean;
};

type ProfileRankingsApiResponse = {
  ok: boolean;
  rankings?: CategoryRanking[];
  error?: string;
};

export function buildCategorySegmentKey(
  metadata: UserMetadata,
  field: keyof UserMetadata
): string {
  const partial = { ...EMPTY_METADATA, [field]: metadata[field] };
  return buildSegmentKey(partial);
}

export async function fetchProfileRankings(
  userId: string,
  _metadata: UserMetadata
): Promise<CategoryRanking[]> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/rankings`,
    { method: "GET", timeoutMs: 15_000 }
  );

  const data = (await response.json()) as ProfileRankingsApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Profile rankings request failed");
  }

  return (data.rankings ?? []).map((ranking) => ({
    key: ranking.key,
    rank: typeof ranking.rank === "number" ? ranking.rank : null,
    isOfficial: ranking.isOfficial === true,
  }));
}
