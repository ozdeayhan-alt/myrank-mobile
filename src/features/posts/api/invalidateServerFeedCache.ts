import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

/** Sunucu bellek feed cache'ini temizler (client-side post create sonrası). */
export async function invalidateServerFeedCache(): Promise<void> {
  try {
    await fetchApi(`${getApiBaseUrl()}/api/feed/invalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    // non-blocking — client cache yine bump edilir
  }
}
