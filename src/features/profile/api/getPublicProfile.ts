import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { parseProfileFields, type ParsedProfileFields } from "./profileDocParsing";

export type PublicProfile = ParsedProfileFields;

type PublicProfileApiResponse = {
  ok: boolean;
  profile: Record<string, unknown>;
  error?: string;
};

export async function getPublicProfile(
  userId: string
): Promise<PublicProfile | null> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/public`,
    { method: "GET", timeoutMs: 15_000 }
  );

  if (response.status === 404) {
    return null;
  }

  const data = (await response.json()) as PublicProfileApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Public profile request failed");
  }

  if (!data.profile) {
    return null;
  }

  return parseProfileFields(data.profile);
}
