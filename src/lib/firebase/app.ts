import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  assertFirebaseClientConfig,
  getFirebaseClientConfig,
} from "./config";

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  const config = getFirebaseClientConfig();
  assertFirebaseClientConfig(config);

  firebaseApp = getApps().length ? getApp() : initializeApp(config);
  return firebaseApp;
}
