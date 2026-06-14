import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from "firebase/auth";
import { getFirebaseApp } from "./app";
import { getAuthPersistence } from "./authPersistence";

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
    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}
