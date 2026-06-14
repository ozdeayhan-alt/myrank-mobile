/**
 * Mobile Firebase client SDK only (firebase/app + firebase/auth).
 * Server Admin SDK lives in /root/myrankapp/firebase-config.js — never import it here.
 */
export {
  assertFirebaseClientConfig,
  getFirebaseClientConfig,
  type FirebaseClientConfig,
} from "./config";
export { getFirebaseApp } from "./app";
export { getFirebaseAuth } from "./auth";
export { getFirestoreDb } from "./firestore";
export { getFirebaseStorage } from "./storage";
