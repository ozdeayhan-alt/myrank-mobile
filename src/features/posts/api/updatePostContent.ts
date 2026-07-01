import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type UpdatePostContentResponse = {
  ok: boolean;
  postId: string;
  content: string;
  error?: string;
};

export async function updatePostContent(
  postId: string,
  content: string
): Promise<string> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/posts/${encodeURIComponent(postId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      timeoutMs: 20000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as UpdatePostContentResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Gönderi güncellenemedi");
  }

  return data.content;
}
