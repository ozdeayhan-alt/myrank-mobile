import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { UserMetadata } from "../types";
import {
  EMPTY_BIO_CATEGORY_VISIBILITY,
  type BioCategoryVisibility,
} from "../utils/bioCategoryVisibility";
import { metadataToFirestore } from "./profileDocParsing";

const PUBLIC_PROFILES_COLLECTION = "publicProfiles";

export type SyncPublicProfileInput = {
  displayName: string;
  photoURL?: string;
  bio?: string;
  bioCategoryVisibility?: BioCategoryVisibility;
  metadata: UserMetadata;
  /** Only applied when creating the public profile document. */
  totalScore?: number;
};

function buildPublicProfilePayload(input: SyncPublicProfileInput) {
  const trimmedName = input.displayName.trim();

  return {
    displayName: trimmedName,
    displayNameLower: trimmedName.toLocaleLowerCase("tr-TR"),
    photoURL: input.photoURL?.trim() ?? "",
    bio: input.bio?.trim() ?? "",
    bioCategoryVisibility:
      input.bioCategoryVisibility ?? EMPTY_BIO_CATEGORY_VISIBILITY,
    metadata: metadataToFirestore(input.metadata),
  };
}

function bioVisibilityMatches(
  existing: unknown,
  next: BioCategoryVisibility
): boolean {
  if (!existing || typeof existing !== "object") {
    return JSON.stringify(EMPTY_BIO_CATEGORY_VISIBILITY) === JSON.stringify(next);
  }

  return JSON.stringify(existing) === JSON.stringify(next);
}

function publicProfileMatchesExisting(
  existingData: Record<string, unknown>,
  payload: ReturnType<typeof buildPublicProfilePayload>
): boolean {
  const existingMetadata = existingData.metadata as Record<string, unknown> | undefined;

  return (
    String(existingData.displayName ?? "").trim() === payload.displayName &&
    String(existingData.photoURL ?? "").trim() === payload.photoURL &&
    String(existingData.bio ?? "").trim() === payload.bio &&
    bioVisibilityMatches(existingData.bioCategoryVisibility, payload.bioCategoryVisibility) &&
    JSON.stringify(existingMetadata ?? {}) === JSON.stringify(payload.metadata)
  );
}

export async function syncPublicProfile(
  userId: string,
  input: SyncPublicProfileInput
): Promise<void> {
  const db = getFirestoreDb();
  const ref = doc(db, PUBLIC_PROFILES_COLLECTION, userId);
  const existing = await getDoc(ref);

  const payload = buildPublicProfilePayload(input);

  if (existing.exists() && publicProfileMatchesExisting(existing.data(), payload)) {
    return;
  }

  const writePayload: Record<string, unknown> = {
    ...payload,
    updatedAt: serverTimestamp(),
  };

  if (!existing.exists()) {
    writePayload.totalScore = input.totalScore ?? 0;
  }

  await setDoc(ref, writePayload, { merge: true });
}
