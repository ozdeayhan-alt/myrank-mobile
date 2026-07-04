import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";
import type { DuelVoteBatchResult, DuelVoteEntry } from "../types";

export type FetchDuelVoteBatchResponse = {
  ok: boolean;
  results: DuelVoteBatchResult[];
};

export async function fetchDuelVoteBatch(
  votes: DuelVoteEntry[]
): Promise<FetchDuelVoteBatchResponse> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/duel/votes/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ votes }),
    timeoutMs: 20000,
  });

  const data = (await response.json()) as FetchDuelVoteBatchResponse & {
    error?: string;
  };
  throwIfNotOk(response, data, data.error ?? "Düello oyları gönderilemedi");

  return data;
}
