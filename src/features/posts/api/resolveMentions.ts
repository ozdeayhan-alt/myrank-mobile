import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";

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
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/posts/mentions/resolve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokens }),
      timeoutMs: 15000,
    }
  );

  const data = (await response.json()) as {
    mentions?: ResolvedMention[];
    error?: string;
  };
  throwIfNotOk(response, data, data.error ?? "Mention çözümlenemedi");

  return data.mentions ?? [];
}
