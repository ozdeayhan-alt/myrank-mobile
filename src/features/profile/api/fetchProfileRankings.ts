import { GLOBAL_RANKING_SEGMENT } from "@/features/filters/constants";
import { resolveSegmentRank } from "./resolveSegmentRank";
import {
  buildSegmentKey,
  EMPTY_METADATA,
  type UserMetadata,
} from "../types";

export type ProfileRankingKey = keyof UserMetadata | "global";

export type CategoryRanking = {
  key: ProfileRankingKey;
  rank: number | null;
  isOfficial: boolean;
};

const CATEGORY_KEYS: (keyof UserMetadata)[] = [
  "country",
  "city",
  "age",
  "gender",
  "profession",
  "maritalStatus",
];

function hasMetadataValue(
  metadata: UserMetadata,
  key: keyof UserMetadata
): boolean {
  if (key === "age") {
    return metadata.age !== null && metadata.age > 0;
  }
  const value = metadata[key];
  return typeof value === "string" && value.trim().length > 0;
}

async function fetchCategoryRanking(
  userId: string,
  metadata: UserMetadata,
  key: keyof UserMetadata
): Promise<CategoryRanking> {
  const segmentKey = buildCategorySegmentKey(metadata, key);
  const { rank, isOfficial } = await resolveSegmentRank(segmentKey, userId);
  return { key, rank, isOfficial };
}

async function fetchGlobalRanking(userId: string): Promise<CategoryRanking> {
  const { rank, isOfficial } = await resolveSegmentRank(
    GLOBAL_RANKING_SEGMENT,
    userId
  );
  return { key: "global", rank, isOfficial };
}

function buildCategorySegmentKey(
  metadata: UserMetadata,
  field: keyof UserMetadata
): string {
  const partial = { ...EMPTY_METADATA, [field]: metadata[field] };
  return buildSegmentKey(partial);
}

export async function fetchProfileRankings(
  userId: string,
  metadata: UserMetadata
): Promise<CategoryRanking[]> {
  const activeKeys = CATEGORY_KEYS.filter((key) =>
    hasMetadataValue(metadata, key)
  );

  const categoryRankings = await Promise.all(
    activeKeys.map((key) => fetchCategoryRanking(userId, metadata, key))
  );
  const globalRanking = await fetchGlobalRanking(userId);

  return [...categoryRankings, globalRanking];
}
