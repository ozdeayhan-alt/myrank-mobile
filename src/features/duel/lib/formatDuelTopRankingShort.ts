import type { ProfileRankingKey } from "@/features/profile/api/fetchProfileRankings";
import type { UserMetadata } from "@/features/profile/types";
import type { TopRanking } from "@/features/profile/types/achievement";

function turkishOrdinalSuffix(rank: number): string {
  const mod100 = rank % 100;
  const mod10 = rank % 10;
  if (mod100 >= 11 && mod100 <= 19) {
    return "si";
  }
  switch (mod10) {
    case 0:
    case 6:
      return "sı";
    case 1:
    case 2:
    case 7:
    case 8:
      return "si";
    case 3:
    case 4:
      return "ü";
    case 5:
      return "i";
    case 9:
      return "u";
    default:
      return "si";
  }
}

function scopeLabel(
  key: ProfileRankingKey,
  metadata: UserMetadata
): string {
  switch (key) {
    case "city":
      return metadata.city.trim() || "Şehir";
    case "country":
      return metadata.country.trim() || "Türkiye";
    case "global":
      return "Dünya";
    case "profession":
      return metadata.profession.trim() || "Kategori";
    case "gender":
      return metadata.gender.trim() || "Cinsiyet";
    case "age":
      return metadata.age && metadata.age > 0
        ? `${metadata.age} yaş`
        : "Yaş";
    case "maritalStatus":
      return metadata.maritalStatus.trim() || "Medeni durum";
    default:
      return "Kategori";
  }
}

export function formatDuelTopRankingShort(
  key: ProfileRankingKey,
  metadata: UserMetadata,
  rank: number
): string {
  const scope = scopeLabel(key, metadata);
  const formattedRank = rank.toLocaleString("tr-TR");
  return `${scope} ${formattedRank}.${turkishOrdinalSuffix(rank)}`;
}

export function formatTopRankingShort(
  top: TopRanking,
  metadata: UserMetadata
): string {
  return formatDuelTopRankingShort(top.key, metadata, top.rank);
}
