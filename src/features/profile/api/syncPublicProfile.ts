import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { UserMetadata } from "../types";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";

export type SyncPublicProfileInput = {
  displayName: string;
  photoURL?: string;
  bio?: string;
  bioCategoryVisibility?: BioCategoryVisibility;
  metadata: UserMetadata;
  /** Only applied when creating the public profile document. */
  totalScore?: number;
};

type SyncPublicProfileApiResponse = {
  ok: boolean;
  synced?: boolean;
  reason?: string;
  error?: string;
};

export async function syncPublicProfile(
  _userId: string,
  _input: SyncPublicProfileInput
): Promise<void> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/me/sync-public`,
    {
      method: "POST",
      timeoutMs: 15_000,
    }
  );

  const data = (await response.json()) as SyncPublicProfileApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Public profile sync failed");
  }
}
