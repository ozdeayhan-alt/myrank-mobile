import { updateProfile } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { UserMetadata } from "../types";
import { ensureRankingEntriesIfNeeded } from "./ensureRankingEntriesIfNeeded";
import { isMetadataComplete } from "../types";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";
import { normalizeBio } from "../utils/normalizeBio";
import { normalizeUserMetadata } from "../utils/normalizeMetadata";
import { metadataToFirestore } from "./profileDocParsing";

type SaveProfileApiResponse = {
  ok: boolean;
  error?: string;
};

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

  const trimmedName = displayName.trim();
  const trimmedBio = normalizeBio(bio);

  const response = await fetchApi(`${getApiBaseUrl()}/api/profile/me`, {
    method: "PUT",
    timeoutMs: 20_000,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      displayName: trimmedName,
      bio: trimmedBio,
      bioCategoryVisibility,
      metadata: metadataToFirestore(normalized),
    }),
  });

  const data = (await response.json()) as SaveProfileApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Profil kaydedilemedi");
  }

  const auth = getFirebaseAuth();
  if (auth.currentUser?.uid === userId) {
    await updateProfile(auth.currentUser, { displayName: trimmedName });
  }

  try {
    await ensureRankingEntriesIfNeeded({ force: true });
  } catch {
    // Profil kaydı başarılı; sıralama kaydı arka planda tekrar denenebilir.
  }
}
