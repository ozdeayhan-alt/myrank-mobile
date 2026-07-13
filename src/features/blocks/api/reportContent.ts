import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";

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
  const response = await fetchApi(`${getApiBaseUrl()}/api/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    timeoutMs: 15000,
  });

  const data = (await response.json().catch(() => ({}))) as ReportResponse;
  throwIfNotOk(response, data, data.error ?? "Şikayet gönderilemedi");
}
