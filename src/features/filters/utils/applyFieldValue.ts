import type { UserMetadata } from "@/features/profile/types";
import type { FilterFieldKey } from "../config/filterFields";

export function applyFieldValue(
  filters: UserMetadata,
  field: FilterFieldKey,
  value: string | number | null
): UserMetadata {
  if (field === "age") {
    if (value === null || value === "") {
      return { ...filters, age: null };
    }
    const age =
      typeof value === "number" ? value : Number.parseInt(String(value), 10);
    return {
      ...filters,
      age: Number.isNaN(age) ? null : age,
    };
  }

  const text = value === null ? "" : String(value).trim();

  if (field === "country") {
    const previousCountry = filters.country.trim();
    const nextCountry = text;
    if (previousCountry !== nextCountry) {
      return { ...filters, country: nextCountry, city: "" };
    }
    return { ...filters, country: nextCountry };
  }

  return { ...filters, [field]: text };
}

export function validateAgeValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const age = Number.parseInt(trimmed, 10);
  if (Number.isNaN(age) || age < 1 || age > 120) {
    return "Geçerli bir yaş girin (1–120).";
  }
  return null;
}
