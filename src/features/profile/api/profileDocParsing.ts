import { EMPTY_METADATA, type UserMetadata } from "../types";
import { normalizeAvatarUrl } from "@/lib/media/normalizeAvatarUrl";
import {
  type BioCategoryVisibility,
  parseBioCategoryVisibility,
} from "../utils/bioCategoryVisibility";

function parseAge(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value) && value > 0) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
  }
  return null;
}

export function parseMetadataFromDoc(data: Record<string, unknown>): UserMetadata {
  const nested = data.metadata as Record<string, unknown> | undefined;

  if (nested) {
    return {
      country: String(nested.country ?? ""),
      city: String(nested.city ?? ""),
      age: parseAge(nested.age),
      gender: String(nested.gender ?? ""),
      profession: String(nested.profession ?? ""),
      maritalStatus: String(nested.maritalStatus ?? ""),
    };
  }

  return {
    country: String(data.country ?? ""),
    city: String(data.city ?? ""),
    age: parseAge(data.age),
    gender: String(data.gender ?? ""),
    profession: String(data.profession ?? ""),
    maritalStatus: String(data.maritalStatus ?? ""),
  };
}

export type ParsedProfileFields = {
  metadata: UserMetadata;
  displayName: string;
  photoURL: string;
  bio: string;
  bioCategoryVisibility: BioCategoryVisibility;
  totalScore: number;
};

export function parseProfileFields(data: Record<string, unknown>): ParsedProfileFields {
  return {
    metadata: parseMetadataFromDoc(data),
    displayName: String(data.displayName ?? ""),
    photoURL: normalizeAvatarUrl(String(data.photoURL ?? "")),
    bio: typeof data.bio === "string" ? data.bio.trim() : "",
    bioCategoryVisibility: parseBioCategoryVisibility(data),
    totalScore: typeof data.totalScore === "number" ? data.totalScore : 0,
  };
}

export function metadataToFirestore(metadata: UserMetadata) {
  return {
    country: metadata.country.trim(),
    city: metadata.city.trim(),
    age: metadata.age,
    gender: metadata.gender.trim(),
    profession: metadata.profession.trim(),
    maritalStatus: metadata.maritalStatus.trim(),
  };
}

export { EMPTY_METADATA };
