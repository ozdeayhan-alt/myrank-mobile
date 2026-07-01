import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export async function unregisterPushToken(expoPushToken: string): Promise<void> {

  await fetchApi(`${getApiBaseUrl()}/api/push/unregister`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expoPushToken }),
    timeoutMs: 15000,
  });
}
