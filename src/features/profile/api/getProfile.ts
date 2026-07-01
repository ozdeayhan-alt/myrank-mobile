import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { EMPTY_METADATA, type UserMetadata } from "../types";
import {
  parseProfileFields,
  type ParsedProfileFields,
} from "./profileDocParsing";

export type LoadedProfile = ParsedProfileFields;

type OwnProfileApiResponse = {
  ok: boolean;
  profile?: Record<string, unknown>;
  error?: string;
};

export async function getProfile(userId: string): Promise<LoadedProfile | null> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/profile/me`, {
    method: "GET",
    timeoutMs: 15_000,
  });

  if (response.status === 404) {
    return null;
  }

  const data = (await response.json()) as OwnProfileApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Profile request failed");
  }

  if (!data.profile) {
    return null;
  }

  const profileUserId =
    typeof data.profile.userId === "string" ? data.profile.userId : userId;
  if (profileUserId !== userId) {
    return null;
  }

  return parseProfileFields(data.profile);
}

export function getEmptyMetadata(): UserMetadata {
  return { ...EMPTY_METADATA };
}
