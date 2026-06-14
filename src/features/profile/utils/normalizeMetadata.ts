import type { UserMetadata } from "../types";

/** Canonical metadata for Firestore, rankings, and explore filters. */
export function normalizeUserMetadata(metadata: UserMetadata): UserMetadata {
  const age =
    metadata.age !== null &&
    typeof metadata.age === "number" &&
    !Number.isNaN(metadata.age) &&
    metadata.age > 0
      ? metadata.age
      : null;

  return {
    country: metadata.country.trim(),
    city: metadata.city.trim(),
    age,
    gender: metadata.gender.trim(),
    profession: metadata.profession.trim(),
    maritalStatus: metadata.maritalStatus.trim(),
  };
}
