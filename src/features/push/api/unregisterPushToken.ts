import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export async function unregisterPushToken(expoPushToken: string): Promise<void> {
  const token = await getApiAuthToken();

  await fetchWithTimeout(`${getApiBaseUrl()}/api/push/unregister`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expoPushToken }),
    timeoutMs: 15000,
  });
}
