import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";

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
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/posts/${encodeURIComponent(postId)}`,
    {
      method: "DELETE",
      timeoutMs: 30000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as DeletePostResponse;
  throwIfNotOk(response, data, data.error ?? "Gönderi silinemedi");

  return data;
}
