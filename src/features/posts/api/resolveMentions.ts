import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export type ResolvedMention = {
  token: string;
  userId: string;
  displayName: string;
};

export async function resolveMentions(
  tokens: string[]
): Promise<ResolvedMention[]> {
  if (tokens.length === 0) {
    return [];
  }

  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/posts/mentions/resolve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tokens }),
      timeoutMs: 15000,
    }
  );

  const data = (await response.json()) as {
    mentions?: ResolvedMention[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Mention çözümlenemedi");
  }

  return data.mentions ?? [];
}
