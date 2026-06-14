import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";
import { devWarn } from "@/lib/devLog";
import { getFirebaseApp } from "./app";

let firestoreDb: Firestore | null = null;

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) {
    const app = getFirebaseApp();
    try {
      firestoreDb = initializeFirestore(app, {
        localCache: persistentLocalCache(),
      });
    } catch (error) {
      const message = String((error as { message?: string }).message ?? error);
      if (message.includes("already been initialized")) {
        firestoreDb = getFirestore(app);
      } else {
        devWarn(
          "[firestore] persistentLocalCache unavailable, using default:",
          error
        );
        firestoreDb = getFirestore(app);
      }
    }
  }
  return firestoreDb;
}
