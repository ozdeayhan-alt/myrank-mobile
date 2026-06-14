import {
  isMetadataComplete,
  type UserMetadata,
} from "@/features/profile/types";

export function hasActiveSegmentFilters(
  filters: UserMetadata | null | undefined
): boolean {
  if (!filters) return false;
  return (
    filters.country.trim().length > 0 ||
    filters.city.trim().length > 0 ||
    filters.gender.trim().length > 0 ||
    (filters.age !== null && filters.age > 0) ||
    filters.profession.trim().length > 0 ||
    filters.maritalStatus.trim().length > 0
  );
}

export function postMatchesSegmentFilters(
  postMetadata: UserMetadata | undefined,
  filters: UserMetadata
): boolean {
  if (!hasActiveSegmentFilters(filters)) {
    return true;
  }

  if (!postMetadata) {
    return false;
  }

  if (filters.country.trim() && postMetadata.country !== filters.country.trim()) {
    return false;
  }
  if (filters.city.trim() && postMetadata.city !== filters.city.trim()) {
    return false;
  }
  if (filters.gender.trim() && postMetadata.gender !== filters.gender.trim()) {
    return false;
  }
  if (
    filters.age !== null &&
    filters.age > 0 &&
    postMetadata.age !== filters.age
  ) {
    return false;
  }
  if (
    filters.profession.trim() &&
    postMetadata.profession !== filters.profession.trim()
  ) {
    return false;
  }
  if (
    filters.maritalStatus.trim() &&
    postMetadata.maritalStatus !== filters.maritalStatus.trim()
  ) {
    return false;
  }

  return true;
}

export function shouldQueryBySegmentKey(filters: UserMetadata): boolean {
  return isMetadataComplete(filters);
}
