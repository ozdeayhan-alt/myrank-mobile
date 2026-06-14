import { resolveSegmentRank } from "./resolveSegmentRank";
import {
  buildSegmentKey,
  EMPTY_METADATA,
  type UserMetadata,
} from "../types";

export type CategoryRanking = {
  key: keyof UserMetadata;
  label: string;
  value: string;
  rank: number | null;
  totalInSegment: number;
  isOfficial: boolean;
};

const CATEGORIES: { key: keyof UserMetadata; label: string }[] = [
  { key: "country", label: "Ülke" },
  { key: "city", label: "Şehir" },
  { key: "age", label: "Yaş" },
  { key: "gender", label: "Cinsiyet" },
  { key: "profession", label: "Meslek" },
  { key: "maritalStatus", label: "Medeni Durum" },
];

function formatValue(metadata: UserMetadata, key: keyof UserMetadata): string {
  if (key === "age") {
    return metadata.age !== null ? String(metadata.age) : "—";
  }
  return metadata[key] || "—";
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
  return Promise.all(
    CATEGORIES.map(async ({ key, label }) => {
      const segmentKey = buildCategorySegmentKey(metadata, key);
      const { rank, totalInSegment, isOfficial } = await resolveSegmentRank(
        segmentKey,
        userId
      );
      return {
        key,
        label,
        value: formatValue(metadata, key),
        rank,
        totalInSegment,
        isOfficial,
      };
    })
  );
}
