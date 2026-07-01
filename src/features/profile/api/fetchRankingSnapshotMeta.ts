import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export type RankingSnapshotMeta = {
  rebuiltAt: Date | null;
  timezone: string | null;
};

type SnapshotMetaApiResponse = {
  ok: boolean;
  meta: {
    rebuiltAt: string | null;
    timezone: string | null;
    mode?: string | null;
  };
  error?: string;
};

export async function fetchRankingSnapshotMeta(): Promise<RankingSnapshotMeta> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/ranking/snapshot-meta`,
    { method: "GET", timeoutMs: 15_000 }
  );

  const data = (await response.json()) as SnapshotMetaApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Ranking snapshot meta request failed");
  }

  const rebuiltAtRaw = data.meta?.rebuiltAt;
  return {
    rebuiltAt: rebuiltAtRaw ? new Date(rebuiltAtRaw) : null,
    timezone:
      typeof data.meta?.timezone === "string"
        ? data.meta.timezone
        : "Europe/Istanbul",
  };
}

export function formatOfficialRankUpdatedAt(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
