import type { UserMetadata } from "@/features/profile/types";
import { getCitiesForCountry } from "../data/citiesByCountry";
import { getProfessionOptions } from "../data/professions";

export type FilterFieldKey = keyof UserMetadata;
export type FilterType = "searchable" | "static";

export type FilterFieldConfig = {
  key: FilterFieldKey;
  label: string;
  filterType: FilterType;
};

export const FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "country", label: "Ülke", filterType: "searchable" },
  { key: "city", label: "Şehir", filterType: "searchable" },
  { key: "age", label: "Yaş", filterType: "searchable" },
  { key: "profession", label: "Meslek", filterType: "searchable" },
  { key: "gender", label: "Cinsiyet", filterType: "static" },
  { key: "maritalStatus", label: "Medeni Durum", filterType: "static" },
];

export const MARITAL_STATUS_PREFER_NOT_TO_SAY = "Belirtmek istemiyorum";

export const STATIC_OPTIONS: Record<
  "gender" | "maritalStatus",
  readonly string[]
> = {
  gender: ["Kadın", "Erkek"],
  maritalStatus: ["Bekar", "Evli", MARITAL_STATUS_PREFER_NOT_TO_SAY],
};

export const SEARCHABLE_PRESETS: Record<
  "country" | "city" | "profession",
  readonly string[]
> = {
  country: [
    "Türkiye",
    "Almanya",
    "Fransa",
    "İngiltere",
    "ABD",
    "Hollanda",
    "İtalya",
    "İspanya",
    "Avustralya",
    "Kanada",
  ],
  city: [
    "İstanbul",
    "Ankara",
    "İzmir",
    "Bursa",
    "Antalya",
    "Adana",
    "Berlin",
    "Londra",
    "Paris",
    "New York",
  ],
  profession: [
    "Öğrenci",
    "Serbest Meslek",
    "Emekli",
    "Memur",
    "Ev Hanımı",
  ],
};

export const AGE_OPTIONS: string[] = Array.from({ length: 83 }, (_, i) =>
  String(i + 18)
);

export function getFieldConfig(
  key: FilterFieldKey | null
): FilterFieldConfig | null {
  if (!key) return null;
  return FILTER_FIELDS.find((f) => f.key === key) ?? null;
}

export function isCityFieldDisabled(filters?: UserMetadata | null): boolean {
  return !filters?.country?.trim();
}

export function isMaritalStatusDeclined(value: string): boolean {
  return (
    value.trim().toLocaleLowerCase("tr-TR") ===
    MARITAL_STATUS_PREFER_NOT_TO_SAY.toLocaleLowerCase("tr-TR")
  );
}

export function getOptionsForField(
  key: FilterFieldKey,
  filters?: UserMetadata | null
): string[] {
  if (key === "age") {
    return AGE_OPTIONS;
  }
  if (key === "gender" || key === "maritalStatus") {
    return [...STATIC_OPTIONS[key]];
  }
  if (key === "city") {
    if (!filters?.country?.trim()) {
      return [];
    }
    const cities = getCitiesForCountry(filters.country);
    return cities ?? [];
  }
  if (key === "profession") {
    return getProfessionOptions();
  }
  return [...SEARCHABLE_PRESETS[key]];
}

export function formatFilterChipValue(
  key: FilterFieldKey,
  filters: UserMetadata | null
): string {
  if (!filters) {
    return "—";
  }
  if (key === "age") {
    return filters.age !== null && filters.age > 0 ? String(filters.age) : "—";
  }
  const value = filters[key];
  return typeof value === "string" && value.trim() ? value.trim() : "—";
}
