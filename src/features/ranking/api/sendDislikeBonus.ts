import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { BonusPoints } from "../constants";
import type { DislikeBonusResponse } from "../types";

export type DislikeBonusRequest = {
  postId: string;
  bonusPoints: BonusPoints;
};

export async function sendDislikeBonus(
  request: DislikeBonusRequest
): Promise<DislikeBonusResponse> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/interactions/dislike-bonus`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      timeoutMs: 20000,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const apiError =
      typeof data.error === "string" && data.error.trim()
        ? data.error.trim()
        : "Beğenmeme bonusu gönderilemedi";
    throw new Error(apiError);
  }

  return data as DislikeBonusResponse;
}
