import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

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
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/profile-votes/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
