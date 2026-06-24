import { updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import type { UserMetadata } from "../types";
import { ensureRankingEntries } from "./ensureRankingEntries";
import { syncPublicProfile } from "./syncPublicProfile";
import { isMetadataComplete } from "../types";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";
import { normalizeBio } from "../utils/normalizeBio";
import { normalizeUserMetadata } from "../utils/normalizeMetadata";

const USERS_COLLECTION = "users";

export async function saveProfile(
  userId: string,
  email: string,
  metadata: UserMetadata,
  displayName: string,
  bio = "",
  bioCategoryVisibility: BioCategoryVisibility
): Promise<void> {
  const normalized = normalizeUserMetadata(metadata);

  if (!isMetadataComplete(normalized)) {
    throw new Error("Tüm kategori alanları doldurulmalıdır.");
  }

  const db = getFirestoreDb();
  const ref = doc(db, USERS_COLLECTION, userId);
  const existing = await getDoc(ref);
  const trimmedName = displayName.trim();
  const trimmedBio = normalizeBio(bio);

  const payload: Record<string, unknown> = {
    email: email.trim(),
    displayName: trimmedName,
    bio: trimmedBio,
    bioCategoryVisibility,
    metadata: {
      country: normalized.country,
      city: normalized.city,
      age: normalized.age,
      gender: normalized.gender,
      profession: normalized.profession,
      maritalStatus: normalized.maritalStatus,
    },
    updatedAt: serverTimestamp(),
  };

  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
    payload.totalScore = 0;
  }

  await setDoc(ref, payload, { merge: true });

  const totalScore =
    existing.exists() && typeof existing.data()?.totalScore === "number"
      ? (existing.data()?.totalScore as number)
      : 0;

  const existingPhoto =
    typeof existing.data()?.photoURL === "string"
      ? (existing.data()?.photoURL as string)
      : "";

  await syncPublicProfile(userId, {
    displayName: trimmedName,
    photoURL: existingPhoto,
    bio: trimmedBio,
    bioCategoryVisibility,
    metadata: normalized,
    totalScore,
  });

  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: trimmedName });
  }

  try {
    await ensureRankingEntries({ profileSaved: true });
  } catch {
    // Profil kaydı başarılı; sıralama kaydı arka planda tekrar denenebilir.
  }
}
