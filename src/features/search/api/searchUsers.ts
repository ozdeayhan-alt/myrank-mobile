import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { SearchUsersResponse } from "../types";

export const MIN_USER_SEARCH_LENGTH = 2;

export async function searchUsers(query: string): Promise<SearchUsersResponse> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_USER_SEARCH_LENGTH) {
    return { ok: true, users: [], query: trimmed };
  }

  const token = await getApiAuthToken();
  const params = new URLSearchParams({
    q: trimmed,
    limit: "20",
  });

  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/search/users?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 15000,
    }
  );

  const rawText = await response.text();
  let data: SearchUsersResponse = { ok: false, users: [] };
  try {
    data = rawText ? (JSON.parse(rawText) as SearchUsersResponse) : data;
  } catch {
    if (response.status === 404) {
      throw new Error(
        "Arama servisi bulunamadı. Sunucunun yeniden başlatılması gerekebilir."
      );
    }
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Arama yapılamadı");
  }

  return data;
}
