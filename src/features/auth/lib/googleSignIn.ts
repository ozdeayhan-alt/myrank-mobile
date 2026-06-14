import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

let configured = false;

export function isGoogleSignInConfigured(): boolean {
  return WEB_CLIENT_ID.length > 0;
}

function ensureConfigured(): void {
  if (!isGoogleSignInConfigured()) {
    throw new Error(
      "Google girişi yapılandırılmamış. EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ekleyin."
    );
  }

  if (!configured) {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
    configured = true;
  }
}

export async function signInWithGoogleCredential(): Promise<void> {
  ensureConfigured();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();

  const idToken =
    result.data?.idToken ??
    (result as { idToken?: string | null }).idToken ??
    null;

  if (!idToken) {
    throw new Error("Google kimlik doğrulaması başarısız.");
  }

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(getFirebaseAuth(), credential);
}
