import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from "firebase/auth";
import { getFirebaseApp } from "./app";
import { getAuthPersistence } from "./authPersistence";
import { recordError } from "@/lib/crashReporting";

let firebaseAuth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = getFirebaseApp();

  try {
    firebaseAuth = initializeAuth(app, {
      persistence: getAuthPersistence() as Persistence,
    });
  } catch (error) {
    console.error(
      "Firebase initializeAuth başarısız; getAuth fallback kullanılıyor:",
      error
    );
    recordError(error, "Firebase:initializeAuthFallback");
    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}
