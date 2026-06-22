import { normalizeAvatarUrl, shouldRefreshAvatarFromProfile } from "@/lib/media/normalizeAvatarUrl";

export type UserMetadata = {
  country: string;
  city: string;
  age: number | null;
  gender: string;
  profession: string;
  maritalStatus: string;
};

/** @deprecated Use UserMetadata */
export type UserProfile = UserMetadata;

export type UserDocument = {
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  bioCategoryVisibility?: Record<string, boolean>;
  metadata: UserMetadata;
  totalScore: number;
  updatedAt?: string;
  createdAt?: string;
};

export const DEFAULT_DISPLAY_NAME = "İsimsiz Kullanıcı";

export function resolveDisplayName(
  firestoreName?: string | null,
  authName?: string | null
): string {
  const trimmed = firestoreName?.trim();
  if (trimmed) return trimmed;
  const authTrimmed = authName?.trim();
  if (authTrimmed) return authTrimmed;
  return DEFAULT_DISPLAY_NAME;
}

export function resolvePhotoURL(
  firestorePhoto?: string | null,
  authPhoto?: string | null
): string {
  const firestoreTrimmed = firestorePhoto?.trim() ?? "";
  const authTrimmed = authPhoto?.trim() ?? "";

  if (firestoreTrimmed && !shouldRefreshAvatarFromProfile(firestoreTrimmed)) {
    return normalizeAvatarUrl(firestoreTrimmed);
  }
  if (authTrimmed) {
    return normalizeAvatarUrl(authTrimmed);
  }
  if (firestoreTrimmed) {
    return normalizeAvatarUrl(firestoreTrimmed);
  }
  return "";
}

export const EMPTY_METADATA: UserMetadata = {
  country: "",
  city: "",
  age: null,
  gender: "",
  profession: "",
  maritalStatus: "",
};

/** @deprecated Use EMPTY_METADATA */
export const EMPTY_PROFILE = EMPTY_METADATA;

export function isMetadataComplete(metadata: UserMetadata): boolean {
  return (
    metadata.country.trim().length > 0 &&
    metadata.city.trim().length > 0 &&
    metadata.age !== null &&
    metadata.age > 0 &&
    metadata.gender.trim().length > 0 &&
    metadata.profession.trim().length > 0 &&
    metadata.maritalStatus.trim().length > 0
  );
}

/** @deprecated Use isMetadataComplete */
export const isProfileComplete = isMetadataComplete;

export function buildSegmentKey(metadata: Partial<UserMetadata>): string {
  const parts = [
    `country:${metadata.country ?? ""}`,
    `city:${metadata.city ?? ""}`,
    `gender:${metadata.gender ?? ""}`,
    `age:${metadata.age ?? ""}`,
    `profession:${metadata.profession ?? ""}`,
    `maritalStatus:${metadata.maritalStatus ?? ""}`,
  ];
  return parts.join("|");
}
