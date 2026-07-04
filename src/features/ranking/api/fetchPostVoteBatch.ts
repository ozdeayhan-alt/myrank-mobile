import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";
import type { EngagementStatus, PostCounts } from "@/features/ranking/types";

export type PostVoteBatchResponse = {
  ok: boolean;
  postId: string;
  authorId: string;
  postScore: number;
  authorTotalScore: number;
  delta: number;
  scoreDelta: number;
  counts: PostCounts;
  engagement: EngagementStatus;
};

export async function fetchPostVoteBatch(
  postId: string,
  delta: number
): Promise<PostVoteBatchResponse> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/post-votes/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId, delta }),
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as PostVoteBatchResponse & {
    error?: string;
  };
  throwIfNotOk(response, data, data.error ?? "Gönderi oyu gönderilemedi");

  return data;
}
