import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export async function notifyMentions(
  postId: string,
  mentionUserIds: string[]
): Promise<void> {
  if (!postId || mentionUserIds.length === 0) {
    return;
  }

  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/posts/mentions/notify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, mentionUserIds }),
      timeoutMs: 15000,
    }
  );

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? "Mention bildirimi gönderilemedi");
  }
}
