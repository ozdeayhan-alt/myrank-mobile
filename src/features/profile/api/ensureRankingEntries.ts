import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { rankingEnsureError } from "./rankingEnsureError";

type EnsureRankingEntriesResponse = {
  ok: boolean;
  ensured: boolean;
  reason?: string;
};

export async function ensureRankingEntries(options?: {
  profileSaved?: boolean;
}): Promise<EnsureRankingEntriesResponse> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/profile/ensure-ranking-entries`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
