import { isMaritalStatusDeclined } from "@/features/filters/config/filterFields";
import type { ProfileRankingKey } from "../api/fetchProfileRankings";
import type { UserMetadata } from "../types";
import type { GaugeDirection } from "../components/profileTotalScoreGaugeGeometry";

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

function getIntegratedLocativeSuffix(name: string): string {
  const lower = name.trim().toLocaleLowerCase("tr-TR");
  const lastVowel = findLastVowel(lower);
  const front = isFrontVowel(lastVowel);
  const lastChar = lower[lower.length - 1] ?? "";
  const endsWithVowel = VOWELS.includes(lastChar);
  const hardConsonants = "fstkçşhp";

  if (endsWithVowel) {
    return front ? "de" : "da";
  }
  if (hardConsonants.includes(lastChar)) {
    return front ? "te" : "ta";
  }
  return front ? "de" : "da";
}

function withIntegratedLocative(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const suffix = getIntegratedLocativeSuffix(trimmed);
  const base =
    trimmed.charAt(0).toLocaleUpperCase("tr-TR") + trimmed.slice(1);
  return `${base}${suffix}`;
}

function formatRankNumber(rank: number): string {
  return rank.toLocaleString("tr-TR");
}

function capitalizeSentence(text: string): string {
  if (!text) return text;
  return text.charAt(0).toLocaleUpperCase("tr-TR") + text.slice(1);
}

/** Gauge sağ etiketi: "Erkeklerde 2. sıraya yükselmek için" */
function buildScopeLocative(
  key: ProfileRankingKey,
  metadata: UserMetadata
): string {
  switch (key) {
    case "country": {
      const country = metadata.country.trim();
      return country ? withLocative(country) : "Genel sıralamada";
    }
    case "city": {
      const city = metadata.city.trim();
      return city ? withLocative(city) : "Genel sıralamada";
    }
    case "age": {
      if (metadata.age !== null && metadata.age > 0) {
        return `${metadata.age} yaşında`;
      }
      return "Yaş grubunda";
    }
    case "gender": {
      const group = genderPlural(metadata.gender);
      return group ? withIntegratedLocative(group) : "Cinsiyet grubunda";
    }
    case "profession": {
      const group = pluralizeProfession(metadata.profession);
      return group ? withIntegratedLocative(group) : "Meslek grubunda";
    }
    case "maritalStatus": {
      if (isMaritalStatusDeclined(metadata.maritalStatus)) {
        return "Medeni durum belirtmeyenlerde";
      }
      const group = maritalPlural(metadata.maritalStatus);
      return group ? withIntegratedLocative(group) : "Medeni durum grubunda";
    }
    case "global":
      return "Genel sıralamada";
    default:
      return "Genel sıralamada";
  }
}

export type FormatGaugeTargetLabelInput = {
  key: ProfileRankingKey;
  metadata: UserMetadata;
  /** Aktif merdiven basamağının sıra numarası (Yükselt/Alçalt hedefi) */
  targetRank: number | null;
  direction: GaugeDirection;
  /** Yukarı: lider; aşağı: son sıra — hedef yok */
  noTarget?: boolean;
  /** Global 1. — tüm hedefler bitti */
  atPinnacle?: boolean;
  /** Genel listede en düşük — aşağı hedef yok */
  atGlobalLast?: boolean;
};

export function formatGaugeTargetLabel({
  key,
  metadata,
  targetRank,
  direction,
  noTarget = false,
  atPinnacle = false,
  atGlobalLast = false,
}: FormatGaugeTargetLabelInput): string {
  const scope = buildScopeLocative(key, metadata);

  if (direction === "up") {
    if (atPinnacle) {
      return capitalizeSentence("Zirvedesin zaten");
    }
    if (noTarget || targetRank === null || targetRank <= 0) {
      return "";
    }
    return capitalizeSentence(
      `${scope} ${formatRankNumber(targetRank)}. sıraya yükselmek için`
    );
  }

  if (atGlobalLast) {
    return capitalizeSentence("Genel sıralamada son sıradasın");
  }

  if (noTarget || targetRank === null || targetRank <= 0) {
    return "";
  }

  return capitalizeSentence(
    `${scope} ${formatRankNumber(targetRank)}. sıraya düşmek için`
  );
}
