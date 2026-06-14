import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "other";

type ReportResponse = {
  ok?: boolean;
  error?: string;
};

export async function reportContent(input: {
  targetUserId?: string;
  targetPostId?: string;
  reason: ReportReason;
  details?: string;
}): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/reports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    timeoutMs: 15000,
  });

  const data = (await response.json().catch(() => ({}))) as ReportResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Şikayet gönderilemedi");
  }
}
