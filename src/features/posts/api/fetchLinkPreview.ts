import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";

export type LinkPreview = {
  linkUrl: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
};

type LinkPreviewResponse = {
  ok: boolean;
  preview: LinkPreview;
  error?: string;
};

export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const response = await fetchApi(`${getApiBaseUrl()}/api/links/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: trimmed }),
    timeoutMs: 12_000,
  });

  const data = (await response.json()) as LinkPreviewResponse;
  if (!response.ok) {
    throwIfNotOk(response, data, data.error ?? "Link önizlemesi alınamadı");
  }

  return data.preview ?? null;
}
