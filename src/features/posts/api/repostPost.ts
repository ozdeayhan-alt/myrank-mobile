import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

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
  const response = await fetchApi(`${getApiBaseUrl()}/api/posts/repost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
