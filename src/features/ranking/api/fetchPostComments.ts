import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { PostComment } from "../types";

type CommentsApiResponse = {
  ok: boolean;
  comments: PostComment[];
  error?: string;
};

export async function fetchPostComments(postId: string): Promise<PostComment[]> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: "GET",
      timeoutMs: 20_000,
    }
  );

  const data = (await response.json()) as CommentsApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Comments request failed");
  }

  return data.comments ?? [];
}
