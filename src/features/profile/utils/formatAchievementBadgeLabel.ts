import type { ProfileRankingKey } from "../api/fetchProfileRankings";
import type { UserMetadata } from "../types";

const CATEGORY_LABELS: Record<ProfileRankingKey, string> = {
  country: "Ülke",
  city: "Şehir",
  age: "Yaş",
  gender: "Cinsiyet",
  profession: "Meslek",
  maritalStatus: "Medeni Durum",
  global: "Dünya",
};

export function formatAchievementBadgeLabel(
  key: ProfileRankingKey,
  metadata: UserMetadata,
  rank: number
): string {
  const formattedRank = rank.toLocaleString("tr-TR");

  switch (key) {
    case "profession": {
      const name = metadata.profession.trim() || "Kategori";
      return `${name} Kategorisinde ${formattedRank}.`;
    }
    case "city": {
      const city = metadata.city.trim() || "Şehir";
      return `${city} Sıralamasında ${formattedRank}.`;
    }
    case "country": {
      const country = metadata.country.trim() || "Ülke";
      return `${country} Sıralamasında ${formattedRank}.`;
    }
    case "age":
      return metadata.age && metadata.age > 0
        ? `${metadata.age} Yaş Sıralamasında ${formattedRank}.`
        : `Yaş Sıralamasında ${formattedRank}.`;
    case "gender": {
      const gender = metadata.gender.trim() || "Cinsiyet";
      return `${gender} Sıralamasında ${formattedRank}.`;
    }
    case "maritalStatus": {
      const status = metadata.maritalStatus.trim() || "Medeni Durum";
      return `${status} Sıralamasında ${formattedRank}.`;
    }
    case "global":
      return `Dünya Sıralamasında ${formattedRank}.`;
    default:
      return `${CATEGORY_LABELS[key]} Sıralamasında ${formattedRank}.`;
  }
}
