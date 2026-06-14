import { getFirebaseErrorMessage } from "./firebaseErrors";

/** @deprecated Use getFirebaseErrorMessage */
export const getFirestoreErrorMessage = getFirebaseErrorMessage;

export function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}
