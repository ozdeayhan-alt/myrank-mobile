import { Alert } from "react-native";
import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import type { InteractionRequest, InteractionResponse } from "../types";

export async function sendPostInteraction(
  request: InteractionRequest
): Promise<InteractionResponse> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/interactions`,
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
        : "Etkileşim gönderilemedi";
    throw new Error(`${apiError} (${response.status})`);
  }

  return data as InteractionResponse;
}

export async function sendPostInteractionSafe(
  request: InteractionRequest
): Promise<InteractionResponse | null> {
  try {
    return await sendPostInteraction(request);
  } catch (err) {
    Alert.alert("Etkileşim gönderilemedi", getUserFacingErrorMessage(err));
    return null;
  }
}
