import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { rankingEnsureError } from "./rankingEnsureError";

type EnsureRankingEntriesResponse = {
  ok: boolean;
  ensured: boolean;
  reason?: string;
};

export async function ensureRankingEntries(options?: {
  profileSaved?: boolean;
}): Promise<EnsureRankingEntriesResponse> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/ensure-ranking-entries`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      timeoutMs: 30000,
    }
  );

  const data = (await response.json()) as EnsureRankingEntriesResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Sıralama kaydı oluşturulamadı");
  }

  if (!data.ensured) {
    throw rankingEnsureError(data.reason, options);
  }

  return data;
}
