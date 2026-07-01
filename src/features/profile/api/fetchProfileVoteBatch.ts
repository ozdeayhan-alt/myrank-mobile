import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export type ProfileVoteBatchResponse = {
  ok: boolean;
  targetUserId: string;
  totalScore: number;
  delta: number;
  scoreDelta: number;
};

export async function fetchProfileVoteBatch(
  targetUserId: string,
  delta: number
): Promise<ProfileVoteBatchResponse> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile-votes/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetUserId, delta }),
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as ProfileVoteBatchResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Profil oyu gönderilemedi");
  }

  return data;
}
