import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type BlockResponse = {
  ok?: boolean;
  blocked?: boolean;
  error?: string;
};

export async function blockUser(targetUserId: string): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/blocks/${encodeURIComponent(targetUserId)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as BlockResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Engelleme başarısız");
  }
}

export async function unblockUser(targetUserId: string): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/blocks/${encodeURIComponent(targetUserId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as BlockResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Engel kaldırılamadı");
  }
}

export async function fetchBlockStatus(
  targetUserId: string
): Promise<boolean> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/blocks/${encodeURIComponent(targetUserId)}/status`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as BlockResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Engel durumu alınamadı");
  }

  return Boolean(data.blocked);
}
