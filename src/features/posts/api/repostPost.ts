import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export type RepostPostResult = {
  ok: boolean;
  repostId: string;
  originalPostId: string;
  repostCaption: string;
};

export async function repostPost(
  postId: string,
  caption?: string
): Promise<RepostPostResult> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/posts/repost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId, caption: caption ?? "" }),
    timeoutMs: 20000,
  });

  const data = (await response.json()) as RepostPostResult & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Repost başarısız");
  }

  return data;
}
