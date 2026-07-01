import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { UserMetadata } from "@/features/profile/types";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import type { RankingEntry } from "../types";

/** Sıralama sekmesi — segmentteki tüm kayıtlar (şu an ~100; büyüme payı). */
export const RANKING_LIST_MAX = 500;

type RankingApiResponse = {
  ok: boolean;
  entries: RankingEntry[];
  error?: string;
};

function filtersToQueryParams(
  filters: UserMetadata | null
): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters || !hasActiveSegmentFilters(filters)) {
    return params;
  }

  if (filters.country.trim()) params.country = filters.country.trim();
  if (filters.city.trim()) params.city = filters.city.trim();
  if (filters.gender.trim()) params.gender = filters.gender.trim();
  if (filters.age !== null && filters.age > 0) {
    params.age = String(filters.age);
  }
  if (filters.profession.trim()) params.profession = filters.profession.trim();
  if (filters.maritalStatus.trim()) {
    params.maritalStatus = filters.maritalStatus.trim();
  }

  return params;
}

/**
 * Ranking listesi — backend API (client Firestore okuması yerine).
 */
export async function fetchRankingEntries(
  filters: UserMetadata | null,
  max = RANKING_LIST_MAX
): Promise<RankingEntry[]> {
  const params = filtersToQueryParams(filters);
  params.limit = String(max);

  const search = new URLSearchParams(params);
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/ranking/entries?${search.toString()}`,
    {
      method: "GET",
      timeoutMs: 20_000,
    }
  );

  const data = (await response.json()) as RankingApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Ranking request failed");
  }

  return data.entries ?? [];
}
