import { isMaritalStatusDeclined } from "@/features/filters/config/filterFields";
import type { UserMetadata } from "../types";
import type { ProfileRankingKey } from "../api/fetchProfileRankings";

const VOWELS = "aeıioöuü";

const PROFESSION_PLURALS: Record<string, string> = {
  doktor: "doktorlar",
  hemşire: "hemşireler",
  memur: "memurlar",
  "ev hanımı": "ev hanımları",
  öğretmen: "öğretmenler",
  mühendis: "mühendisler",
  avukat: "avukatlar",
  öğrenci: "öğrenciler",
  "serbest meslek": "serbest meslek sahipleri",
};

function findLastVowel(text: string): string {
  for (let i = text.length - 1; i >= 0; i -= 1) {
    const ch = text[i]?.toLocaleLowerCase("tr-TR");
    if (ch && VOWELS.includes(ch)) {
      return ch;
    }
  }
  return "a";
}

function isFrontVowel(vowel: string): boolean {
  return "eiöü".includes(vowel);
}

function getLocativeSuffix(name: string): string {
  const lower = name.trim().toLocaleLowerCase("tr-TR");
  const lastVowel = findLastVowel(lower);
  const front = isFrontVowel(lastVowel);
  const lastChar = lower[lower.length - 1] ?? "";
  const endsWithVowel = VOWELS.includes(lastChar);
  const hardConsonants = "fstkçşhp";

  if (endsWithVowel) {
    return front ? "'de" : "'da";
  }
  if (hardConsonants.includes(lastChar)) {
    return front ? "'te" : "'ta";
  }
  return front ? "'de" : "'da";
}

function withLocative(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `${trimmed}${getLocativeSuffix(trimmed)}`;
}

function pluralizeProfession(profession: string): string {
  const lower = profession.trim().toLocaleLowerCase("tr-TR");
  if (!lower) return "";

  const mapped = PROFESSION_PLURALS[lower];
  if (mapped) return mapped;

  const lastVowel = findLastVowel(lower);
  const suffix = isFrontVowel(lastVowel) ? "ler" : "lar";
  return `${lower}${suffix}`;
}

function genderPlural(gender: string): string {
  const lower = gender.trim().toLocaleLowerCase("tr-TR");
  if (lower === "kadın") return "kadınlar";
  if (lower === "erkek") return "erkekler";
  return lower;
}

function maritalPlural(maritalStatus: string): string {
  const lower = maritalStatus.trim().toLocaleLowerCase("tr-TR");
  if (lower === "bekar") return "bekarlar";
  if (lower === "evli") return "evliler";
  return lower;
}

function capitalizeSentence(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLocaleUpperCase("tr-TR") + text.slice(1);
}

function formatRankNumber(rank: number, isOfficial: boolean): string {
  const formatted = rank.toLocaleString("tr-TR");
  return isOfficial ? formatted : `yaklaşık ${formatted}`;
}

function personWord(isOwnProfile: boolean): string {
  return isOwnProfile ? "kişisin" : "kişi";
}

function buildScopePhrase(
  key: ProfileRankingKey,
  metadata: UserMetadata
): string {
  switch (key) {
    case "country": {
      const country = metadata.country.trim();
      return country ? withLocative(country) : "";
    }
    case "city": {
      const city = metadata.city.trim();
      return city ? withLocative(city) : "";
    }
    case "age": {
      if (metadata.age === null || metadata.age <= 0) return "";
      return `${metadata.age} yaşındaki`;
    }
    case "gender": {
      const group = genderPlural(metadata.gender);
      return group ? `${group} arasında` : "";
    }
    case "profession": {
      const group = pluralizeProfession(metadata.profession);
      return group ? `${group} arasında` : "";
    }
    case "maritalStatus": {
      if (isMaritalStatusDeclined(metadata.maritalStatus)) {
        return "Medeni durumunu belirtmeyenler arasında";
      }
      const group = maritalPlural(metadata.maritalStatus);
      return group ? `${group} arasında` : "";
    }
    case "global":
      return "Dünya genelinde";
    default:
      return "";
  }
}

export type FormatProfileRankingSentenceInput = {
  key: ProfileRankingKey;
  metadata: UserMetadata;
  rank: number | null;
  isOfficial: boolean;
  isOwnProfile: boolean;
};

export function formatProfileRankingSentence({
  key,
  metadata,
  rank,
  isOfficial,
  isOwnProfile,
}: FormatProfileRankingSentenceInput): string {
  if (rank === null) {
    return "Henüz sıralama bilgisi yok.";
  }

  const scope = buildScopePhrase(key, metadata);
  if (!scope) {
    return "Henüz sıralama bilgisi yok.";
  }

  const rankLabel = formatRankNumber(rank, isOfficial);
  const sentence = `${scope} en popüler ${rankLabel}. ${personWord(isOwnProfile)}`;
  return capitalizeSentence(sentence);
}
