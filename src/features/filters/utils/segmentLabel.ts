import {
  buildSegmentKey,
  EMPTY_METADATA,
  type UserMetadata,
} from "@/features/profile/types";
import { GLOBAL_RANKING_SEGMENT } from "../constants";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import type { FilterFieldKey } from "../config/filterFields";
import { FILTER_FIELDS } from "../config/filterFields";

export function countActiveFilters(filters: UserMetadata): number {
  let count = 0;
  if (filters.country.trim()) count += 1;
  if (filters.city.trim()) count += 1;
  if (filters.gender.trim()) count += 1;
  if (filters.age !== null && filters.age > 0) count += 1;
  if (filters.profession.trim()) count += 1;
  if (filters.maritalStatus.trim()) count += 1;
  return count;
}

/** Single-field partial segment used by backend denormalization. */
export function buildSingleFieldSegmentKey(
  filters: UserMetadata
): string | null {
  const activeKeys = FILTER_FIELDS.filter((f) => fieldHasValue(filters, f.key));
  if (activeKeys.length !== 1) return null;
  const key = activeKeys[0].key;
  return buildSegmentKey({
    ...EMPTY_METADATA,
    [key]: filters[key],
  });
}

function fieldHasValue(filters: UserMetadata, key: FilterFieldKey): boolean {
  if (key === "age") {
    return filters.age !== null && filters.age > 0;
  }
  return String(filters[key]).trim().length > 0;
}

export function getFilterSegmentLabel(filters: UserMetadata | null): string {
  if (!filters || !hasActiveSegmentFilters(filters)) {
    return "Global";
  }
  return buildSegmentKey(filters);
}

export function getRankingSegmentKey(filters: UserMetadata | null): string {
  if (!filters || !hasActiveSegmentFilters(filters)) {
    return GLOBAL_RANKING_SEGMENT;
  }
  return buildSegmentKey(filters);
}

export function entryMatchesSegmentFilters(
  entryMetadata: UserMetadata | undefined,
  filters: UserMetadata
): boolean {
  if (!hasActiveSegmentFilters(filters)) {
    return true;
  }
  if (!entryMetadata) {
    return false;
  }

  if (filters.country.trim() && entryMetadata.country !== filters.country.trim()) {
    return false;
  }
  if (filters.city.trim() && entryMetadata.city !== filters.city.trim()) {
    return false;
  }
  if (filters.gender.trim() && entryMetadata.gender !== filters.gender.trim()) {
    return false;
  }
  if (
    filters.age !== null &&
    filters.age > 0 &&
    entryMetadata.age !== filters.age
  ) {
    return false;
  }
  if (
    filters.profession.trim() &&
    entryMetadata.profession !== filters.profession.trim()
  ) {
    return false;
  }
  if (
    filters.maritalStatus.trim() &&
    entryMetadata.maritalStatus !== filters.maritalStatus.trim()
  ) {
    return false;
  }

  return true;
}
