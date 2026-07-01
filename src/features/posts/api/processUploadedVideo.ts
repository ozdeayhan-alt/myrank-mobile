import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type ProcessVideoResponse = {
  ok: boolean;
  status?: "pending" | "complete" | "failed";
  jobId?: string;
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

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 180_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapProcessVideoBody(body: ProcessVideoResponse): ProcessedVideoResult {
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

async function pollVideoJob(jobId: string): Promise<ProcessedVideoResult> {
  const apiUrl = getApiBaseUrl();
  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_POLL_MS) {
    await sleep(POLL_INTERVAL_MS);

    const statusResponse = await fetchApi(
      `${apiUrl}/api/uploads/process-video/${encodeURIComponent(jobId)}`,
      { timeoutMs: 20_000 }
    );

    const body = (await statusResponse.json().catch(
      () => ({})
    )) as ProcessVideoResponse;

    if (body.status === "complete") {
      return mapProcessVideoBody(body);
    }

    if (body.status === "failed" || !statusResponse.ok) {
      const detail = body.error?.trim();
      throw new Error(
        detail
          ? `${detail} (${statusResponse.status})`
          : `Video işleme başarısız (${statusResponse.status})`
      );
    }
  }

  throw new Error("Video işleme zaman aşımına uğradı");
}

export async function processUploadedVideo(
  storagePath: string
): Promise<ProcessedVideoResult> {
  const apiUrl = getApiBaseUrl();

  const response = await fetchApi(`${apiUrl}/api/uploads/process-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storagePath }),
    timeoutMs: 30_000,
  });

  const body = (await response.json().catch(() => ({}))) as ProcessVideoResponse;

  if (response.status === 202 && body.jobId) {
    return pollVideoJob(body.jobId);
  }

  if (!response.ok) {
    const detail = body.error?.trim();
    throw new Error(
      detail
        ? `${detail} (${response.status})`
        : `Video işleme başarısız (${response.status})`
    );
  }

  return mapProcessVideoBody(body);
}
