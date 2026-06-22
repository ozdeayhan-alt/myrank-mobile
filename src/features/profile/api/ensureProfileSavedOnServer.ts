import { getFirebaseAuth } from "@/lib/firebase";
import { useProfileStore } from "../store/useProfileStore";
import { isMetadataComplete } from "../types";
import { normalizeBio } from "../utils/normalizeBio";
import { normalizeUserMetadata } from "../utils/normalizeMetadata";
import { saveProfile } from "./saveProfile";

/**
 * Yerel store'da metadata dolu olsa bile Firestore `users/{uid}` kaydı
 * olmayabilir. Fotoğraf yükleme ve profil görüntüleme öncesi sunucu kaydını garanti eder.
 */
export async function ensureProfileSavedOnServer(): Promise<void> {
  if (useProfileStore.getState().profileSavedOnServer) {
    return;
  }

  const auth = getFirebaseAuth().currentUser;
  if (!auth?.uid || !auth.email?.trim()) {
    throw new Error("Oturum bilgisi bulunamadı.");
  }

  const state = useProfileStore.getState();
  const metadata = normalizeUserMetadata(state.metadata);
  const displayName = state.displayName.trim() || auth.displayName?.trim() || "";

  if (!displayName) {
    throw new Error("Ad Soyad alanı zorunludur.");
  }

  if (!isMetadataComplete(metadata)) {
    throw new Error("Tüm kategori alanları doldurulmalıdır.");
  }

  await saveProfile(
    auth.uid,
    auth.email,
    metadata,
    displayName,
    normalizeBio(state.bio),
    state.bioCategoryVisibility
  );

  useProfileStore.getState().setProfileSavedOnServer(true);
}
