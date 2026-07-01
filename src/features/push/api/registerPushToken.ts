import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type RegisterPushTokenResponse = {
  ok?: boolean;
  error?: string;
};

export async function registerPushToken(
  expoPushToken: string,
  platform: "ios" | "android"
): Promise<void> {

  const response = await fetchApi(
    `${getApiBaseUrl()}/api/push/register`,
    {
      method: "POST",
      headers: {
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
