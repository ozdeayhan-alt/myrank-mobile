import { getFirebaseAuth } from "@/lib/firebase";

/**
 * Backend API istekleri için Firebase ID token döner.
 * Varsayılan: önbellekteki token (düşük gecikme). forceRefresh=true ile yenilenir.
 */
export async function getApiAuthToken(
  forceRefresh = false
): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Oturum açık değil");
  }

  return user.getIdToken(forceRefresh);
}
