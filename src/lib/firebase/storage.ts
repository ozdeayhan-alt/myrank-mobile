import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFirebaseApp } from "./app";
import { getFirebaseClientConfig } from "./config";

let firebaseStorage: FirebaseStorage | null = null;
let cachedBucket: string | null = null;

export function resetFirebaseStorageCache(): void {
  firebaseStorage = null;
  cachedBucket = null;
}

export function getFirebaseStorage(): FirebaseStorage {
  const { storageBucket } = getFirebaseClientConfig();
  if (!storageBucket?.trim()) {
    throw new Error(
      "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET tanımlı değil. .env dosyasını kontrol edin."
    );
  }

  const bucketUrl = storageBucket.startsWith("gs://")
    ? storageBucket
    : `gs://${storageBucket}`;

  if (firebaseStorage && cachedBucket === bucketUrl) {
    return firebaseStorage;
  }

  firebaseStorage = getStorage(getFirebaseApp(), bucketUrl);
  cachedBucket = bucketUrl;
  return firebaseStorage;
}
