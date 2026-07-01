import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type BlockResponse = {
  ok?: boolean;
  blocked?: boolean;
  error?: string;
};

export async function blockUser(targetUserId: string): Promise<void> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/blocks/${encodeURIComponent(targetUserId)}`,
    {
      method: "POST",
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as BlockResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Engelleme başarısız");
  }
}

export async function unblockUser(targetUserId: string): Promise<void> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/blocks/${encodeURIComponent(targetUserId)}`,
    {
      method: "DELETE",
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
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/blocks/${encodeURIComponent(targetUserId)}/status`,
    {
      method: "GET",
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as BlockResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Engel durumu alınamadı");
  }

  return Boolean(data.blocked);
}
