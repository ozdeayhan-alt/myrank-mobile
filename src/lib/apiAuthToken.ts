import { getFirebaseAuth } from "@/lib/firebase";

/**
 * Backend API istekleri için güncel Firebase ID token döner.
 * Süresi dolmuş token hatalarını önlemek için her seferinde yenilenir.
 */
export async function getApiAuthToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Oturum açık değil");
  }

  return user.getIdToken(true);
}
