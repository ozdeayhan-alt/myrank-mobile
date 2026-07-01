import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export type FetchApiInit = RequestInit & { timeoutMs?: number };

/**
 * Authenticated API fetch: cached ID token first, refresh once on 401.
 */
export async function fetchApi(
  url: string,
  init: FetchApiInit = {}
): Promise<Response> {
  const { headers, ...rest } = init;
  let token = await getApiAuthToken();

  let response = await fetchWithTimeout(url, {
    ...rest,
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    token = await getApiAuthToken(true);
    response = await fetchWithTimeout(url, {
      ...rest,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return response;
}
