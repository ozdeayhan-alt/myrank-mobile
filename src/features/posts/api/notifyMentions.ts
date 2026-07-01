import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export async function notifyMentions(
  postId: string,
  mentionUserIds: string[]
): Promise<void> {
  if (!postId || mentionUserIds.length === 0) {
    return;
  }
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/posts/mentions/notify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
