import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
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
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/post-votes/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId, delta }),
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as PostVoteBatchResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Gönderi oyu gönderilemedi");
  }

  return data;
}
