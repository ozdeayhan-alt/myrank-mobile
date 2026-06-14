import type { UserMetadata } from "@/features/profile/types";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import { isMaritalStatusDeclined } from "../config/filterFields";

export type FilterDisplayMode = "explore" | "ranking";

const MARITAL_DECLINED_PHRASE = "medeni durumunu belirtmeyen";
const MARITAL_DECLINED_POSSESSIVE = "medeni durumunu belirtmeyenlerin";

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

function getLocativeSuffix(name: string, withKi: boolean): string {
  const lower = name.trim().toLocaleLowerCase("tr-TR");
  const lastVowel = findLastVowel(lower);
  const front = isFrontVowel(lastVowel);
  const lastChar = lower[lower.length - 1] ?? "";
  const endsWithVowel = VOWELS.includes(lastChar);
  const hardConsonants = "fstkçşhp";

  let base: string;
  if (endsWithVowel) {
    base = front ? "'de" : "'da";
  } else if (hardConsonants.includes(lastChar)) {
    base = front ? "'te" : "'ta";
  } else {
    base = front ? "'de" : "'da";
  }

  return withKi ? `${base}ki` : base;
}

/** İstanbul → İstanbul'da, İzmir → İzmir'de */
function withLocative(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `${trimmed}${getLocativeSuffix(trimmed, false)}`;
}

/** İstanbul → İstanbul'daki, İzmir → İzmir'deki */
function withLocativeDeki(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return `${trimmed}${getLocativeSuffix(trimmed, true)}`;
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

function maritalAdjective(maritalStatus: string): string {
  if (isMaritalStatusDeclined(maritalStatus)) {
    return "";
  }
  const lower = maritalStatus.trim().toLocaleLowerCase("tr-TR");
  if (lower === "bekar") return "bekar";
  if (lower === "evli") return "evli";
  return lower;
}

function capitalizeTitle(title: string): string {
  return title.charAt(0).toLocaleUpperCase("tr-TR") + title.slice(1);
}

/** kadınlar → kadınların, ev hanımları → ev hanımlarının */
function toPossessivePlural(group: string): string {
  const lower = group.toLocaleLowerCase("tr-TR");
  if (lower.endsWith("leri")) {
    return `${group.slice(0, -1)}inin`;
  }
  if (lower.endsWith("ları")) {
    return `${group.slice(0, -1)}ının`;
  }
  const lastVowel = findLastVowel(lower);
  const suffix = isFrontVowel(lastVowel) ? "in" : "ın";
  return `${group}${suffix}`;
}

function buildLocationPhrase(filters: UserMetadata): string {
  const country = filters.country.trim();
  const city = filters.city.trim();

  if (!country) {
    return `${withLocative("Dünya")} yaşayan`;
  }
  if (city) {
    return `${country} ${withLocative(city)} yaşayan`;
  }
  return `${withLocative(country)} yaşayan`;
}

function buildLocationDekiPhrase(filters: UserMetadata): string {
  const country = filters.country.trim();
  const city = filters.city.trim();

  if (!country) {
    return withLocativeDeki("Dünya");
  }
  if (city) {
    return `${country} ${withLocativeDeki(city)}`;
  }
  return withLocativeDeki(country);
}

function buildAudiencePhrase(filters: UserMetadata): string {
  const gender = filters.gender.trim();
  const profession = filters.profession.trim();

  if (gender && profession) {
    const g = genderPlural(gender).replace(/lar$|ler$/, "");
    return `${g} ${pluralizeProfession(profession)}`;
  }
  if (gender) {
    return genderPlural(gender);
  }
  if (profession) {
    return pluralizeProfession(profession);
  }
  return "insanlar";
}

function buildDemographicGroup(filters: UserMetadata): string {
  const gender = filters.gender.trim();
  const profession = filters.profession.trim();

  if (gender && profession) {
    const g = genderPlural(gender).replace(/lar$|ler$/, "");
    return `${g} ${pluralizeProfession(profession)}`;
  }
  if (gender) {
    return genderPlural(gender);
  }
  if (profession) {
    return pluralizeProfession(profession);
  }
  return "";
}

function buildPostOwnerPhrase(filters: UserMetadata): string {
  const age = filters.age !== null && filters.age > 0 ? filters.age : null;
  const maritalDeclined = isMaritalStatusDeclined(filters.maritalStatus);
  const marital = maritalAdjective(filters.maritalStatus);
  const group = buildDemographicGroup(filters);

  if (maritalDeclined) {
    const owner = group
      ? `${MARITAL_DECLINED_PHRASE} ${toPossessivePlural(group)}`
      : MARITAL_DECLINED_POSSESSIVE;

    if (age) {
      return `${age} yaşındaki ${owner}`;
    }
    return owner;
  }

  if (!marital && !group) {
    if (age) {
      return `${age} yaşındakilerin`;
    }
    return "";
  }

  let owner: string;
  if (group) {
    const possessive = toPossessivePlural(group);
    owner = marital ? `${marital} ${possessive}` : possessive;
  } else {
    owner = toPossessivePlural(maritalPlural(marital));
  }

  if (age) {
    return `${age} yaşındaki ${owner}`;
  }
  return owner;
}

function formatExploreTitle(filters: UserMetadata): string {
  const parts: string[] = [];

  const location = buildLocationDekiPhrase(filters);
  if (location) {
    parts.push(location);
  }

  const owner = buildPostOwnerPhrase(filters);
  if (owner) {
    parts.push(owner);
    parts.push("en popüler gönderileri");
  } else {
    parts.push("en popüler gönderiler");
  }

  return capitalizeTitle(parts.join(" "));
}

function formatRankingTitle(filters: UserMetadata): string {
  const parts: string[] = [];

  const location = buildLocationPhrase(filters);
  if (location) {
    parts.push(location);
  }

  if (filters.age !== null && filters.age > 0) {
    parts.push(`${filters.age} yaşındaki`);
  }

  if (isMaritalStatusDeclined(filters.maritalStatus)) {
    parts.push(MARITAL_DECLINED_PHRASE);
  } else {
    const marital = maritalAdjective(filters.maritalStatus);
    if (marital) {
      parts.push(marital);
    }
  }

  const audience = buildAudiencePhrase(filters);
  parts.push(`en popüler ${audience}`);

  return capitalizeTitle(parts.join(" "));
}

export function formatFilterDisplayTitle(
  filters: UserMetadata | null,
  mode: FilterDisplayMode
): string {
  if (!filters || !hasActiveSegmentFilters(filters)) {
    return mode === "ranking" ? "Global sıralama" : "En popüler gönderiler";
  }

  return mode === "explore"
    ? formatExploreTitle(filters)
    : formatRankingTitle(filters);
}
