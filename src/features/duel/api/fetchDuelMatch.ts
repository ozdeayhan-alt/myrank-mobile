import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";
import type { DuelMatch } from "../types";

export type FetchDuelMatchResponse = {
  ok: boolean;
} & DuelMatch;

export async function fetchDuelMatch(
  excludeIds: string[] = []
): Promise<DuelMatch> {
  const params = new URLSearchParams();
  if (excludeIds.length > 0) {
    params.set("excludeIds", excludeIds.join(","));
  }

  const query = params.toString();
  const url = `${getApiBaseUrl()}/api/duel/match${query ? `?${query}` : ""}`;

  const response = await fetchApi(url, { timeoutMs: 15000 });
  const data = (await response.json()) as FetchDuelMatchResponse & {
    error?: string;
  };
  throwIfNotOk(response, data, data.error ?? "Düello yüklenemedi");

  return {
    matchId: data.matchId,
    postA: data.postA,
    postB: data.postB,
  };
}
