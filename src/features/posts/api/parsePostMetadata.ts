import { EMPTY_METADATA, type UserMetadata } from "@/features/profile/types";
import type { DocumentData } from "firebase/firestore";

export function parsePostMetadata(data: DocumentData): UserMetadata | undefined {
  const raw = data.metadata;
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const age =
    typeof raw.age === "number"
      ? raw.age
      : raw.age !== null && raw.age !== undefined
        ? Number.parseInt(String(raw.age), 10)
        : null;

  return {
    country: String(raw.country ?? "").trim(),
    city: String(raw.city ?? "").trim(),
    gender: String(raw.gender ?? "").trim(),
    age: age !== null && !Number.isNaN(age) ? age : null,
    profession: String(raw.profession ?? "").trim(),
    maritalStatus: String(raw.maritalStatus ?? "").trim(),
  };
}

export function metadataOrEmpty(
  metadata: UserMetadata | undefined
): UserMetadata {
  return metadata ?? { ...EMPTY_METADATA };
}
