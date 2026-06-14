import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type RegisterPushTokenResponse = {
  ok?: boolean;
  error?: string;
};

export async function registerPushToken(
  expoPushToken: string,
  platform: "ios" | "android"
): Promise<void> {
  const token = await getApiAuthToken();

  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/push/register`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expoPushToken, platform }),
      timeoutMs: 15000,
    }
  );

  const rawText = await response.text();
  let data: RegisterPushTokenResponse = {};
  try {
    data = rawText ? (JSON.parse(rawText) as RegisterPushTokenResponse) : data;
  } catch {
    if (response.status === 404) {
      throw new Error(
        "Push servisi bulunamadı. Sunucunun yeniden başlatılması gerekebilir."
      );
    }
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Push token kaydedilemedi");
  }
}
