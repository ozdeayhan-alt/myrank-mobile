import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

/** Sunucu bellek feed cache'ini temizler (client-side post create sonrası). */
export async function invalidateServerFeedCache(): Promise<void> {
  try {
    const token = await getApiAuthToken();
    await fetchWithTimeout(`${getApiBaseUrl()}/api/feed/invalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    // non-blocking — client cache yine bump edilir
  }
}
