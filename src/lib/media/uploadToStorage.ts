import * as FileSystem from "expo-file-system/legacy";
import { getDownloadURL, ref } from "firebase/storage";
import { getFirebaseAuth } from "@/lib/firebase";
import { getFirebaseClientConfig } from "@/lib/firebase/config";
import { getFirebaseStorage } from "@/lib/firebase/storage";
import { logFirebaseError } from "@/lib/firebaseErrors";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { buildFirebaseDownloadURL } from "./firebaseStorageUrl";
import { resolveReadableUri } from "./uriToBlob";

type FirebaseStorageUploadResponse = {
  name?: string;
  downloadTokens?: string;
  metadata?: {
    firebaseStorageDownloadTokens?: string;
  };
  error?: {
    message?: string;
  };
};

function assertAuthenticatedUserId(): string {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("Storage yüklemesi için oturum açmanız gerekiyor.");
  }
  return user.uid;
}

function assertStoragePathAllowed(storagePath: string, userId: string): void {
  const allowedPrefixes = [
    `posts/${userId}/`,
    `profiles/${userId}/`,
    `messages/${userId}/`,
  ];

  if (!allowedPrefixes.some((prefix) => storagePath.startsWith(prefix))) {
    throw new Error("Geçersiz yükleme yolu (403)");
  }
}

function extractDownloadToken(payload: FirebaseStorageUploadResponse): string | null {
  const topLevel = payload.downloadTokens?.split(",")[0]?.trim();
  if (topLevel) {
    return topLevel;
  }

  const metadataToken = payload.metadata?.firebaseStorageDownloadTokens
    ?.split(",")[0]
    ?.trim();
  return metadataToken ?? null;
}

function parseUploadError(status: number, bodyText: string): string {
  try {
    const payload = JSON.parse(bodyText) as FirebaseStorageUploadResponse;
    const message = payload.error?.message?.trim();
    if (message) {
      return `${message} (${status})`;
    }
  } catch {
    // ignore JSON parse errors
  }

  return `Storage upload failed (${status})`;
}

async function uploadViaFirebaseRest(
  bucket: string,
  storagePath: string,
  localUri: string,
  contentType: string,
  idToken: string
): Promise<string> {
  const encodedName = encodeURIComponent(storagePath);
  const uploadUrl =
    `https://firebasestorage.googleapis.com/v0/b/${bucket}/o` +
    `?uploadType=media&name=${encodedName}`;

  const result = await FileSystem.uploadAsync(uploadUrl, localUri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Firebase ${idToken}`,
      "Content-Type": contentType,
    },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(parseUploadError(result.status, result.body));
  }

  let payload: FirebaseStorageUploadResponse = {};
  try {
    payload = JSON.parse(result.body) as FirebaseStorageUploadResponse;
  } catch {
    // Response may be empty on some success paths; fall back to getDownloadURL.
  }

  const downloadToken = extractDownloadToken(payload);
  if (downloadToken) {
    return buildFirebaseDownloadURL(bucket, storagePath, downloadToken);
  }

  const storageRef = ref(getFirebaseStorage(), storagePath);
  return getDownloadURL(storageRef);
}

/**
 * Firebase Storage REST + expo-file-system uploadAsync (React Native uyumlu).
 * Blob / uploadBytes kullanılmaz; dosya URI'den doğrudan stream edilir.
 */
export async function uploadFileToStorage(
  storagePath: string,
  localUri: string,
  contentType: string,
  sizeBytes?: number
): Promise<string> {
  if (!storagePath?.trim()) {
    throw new Error("Storage path boş");
  }

  const normalizedPath = storagePath.trim();
  const userId = assertAuthenticatedUserId();
  assertStoragePathAllowed(normalizedPath, userId);

  const bucket = getFirebaseClientConfig().storageBucket;
  if (!bucket?.trim()) {
    throw new Error("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET tanımlı değil.");
  }

  const readableUri = await resolveReadableUri(localUri);

  if (sizeBytes == null) {
    const info = await FileSystem.getInfoAsync(readableUri);
    if (!info.exists || typeof info.size !== "number") {
      throw new Error("Dosya okunamadı.");
    }
  }

  const auth = getFirebaseAuth();

  try {
    let idToken = await auth.currentUser!.getIdToken(true);

    try {
      return await uploadViaFirebaseRest(
        bucket,
        normalizedPath,
        readableUri,
        contentType,
        idToken
      );
    } catch (firstError) {
      const message =
        firstError instanceof Error ? firstError.message : String(firstError);
      if (!message.includes("(401)")) {
        throw firstError;
      }

      idToken = await auth.currentUser!.getIdToken(true);
      return await uploadViaFirebaseRest(
        bucket,
        normalizedPath,
        readableUri,
        contentType,
        idToken
      );
    }
  } catch (error) {
    logFirebaseError("Storage upload (Firebase REST)", error, {
      storagePath: normalizedPath,
      bucket,
      localUri,
      contentType,
    });
    throw new Error(getUserFacingErrorMessage(error));
  }
}
