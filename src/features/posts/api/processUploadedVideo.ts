import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type ProcessVideoResponse = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  hlsURL?: string;
  mediaURL?: string;
  posterURL?: string;
  error?: string;
};

export type ProcessedVideoResult = {
  mediaURL: string;
  hlsURL?: string;
  posterURL?: string;
  skipped?: boolean;
};

export async function processUploadedVideo(
  storagePath: string
): Promise<ProcessedVideoResult> {
  const token = await getApiAuthToken();
  const apiUrl = getApiBaseUrl();

  const response = await fetchWithTimeout(
    `${apiUrl}/api/uploads/process-video`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storagePath }),
      timeoutMs: 180000,
    }
  );

  const body = (await response.json().catch(() => ({}))) as ProcessVideoResponse;

  if (!response.ok) {
    const detail = body.error?.trim();
    throw new Error(
      detail
        ? `${detail} (${response.status})`
        : `Video işleme başarısız (${response.status})`
    );
  }

  if (!body.mediaURL) {
    throw new Error("Sunucu video adresi döndürmedi");
  }

  return {
    mediaURL: body.mediaURL,
    hlsURL: body.hlsURL,
    posterURL: body.posterURL,
    skipped: body.skipped,
  };
}
