import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export type DeletePostResponse = {
  ok: boolean;
  postId: string;
  postScore?: number;
  scoreDelta?: number;
  authorId?: string;
  authorTotalScore?: number | null;
  error?: string;
};

export async function deletePost(postId: string): Promise<DeletePostResponse> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/posts/${encodeURIComponent(postId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 30000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as DeletePostResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Gönderi silinemedi");
  }

  return data;
}
