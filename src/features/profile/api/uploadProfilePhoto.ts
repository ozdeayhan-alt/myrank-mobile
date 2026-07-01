import { prepareImageForUpload } from "@/lib/media/prepareImageForUpload";
import { uploadFileToStorage } from "@/lib/media/uploadToStorage";
import { updateProfile } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { ensureProfileSavedOnServer } from "./ensureProfileSavedOnServer";

type UpdatePhotoApiResponse = {
  ok: boolean;
  photoURL?: string;
  error?: string;
};

export async function uploadProfilePhoto(
  userId: string,
  localUri: string,
  _mimeType?: string | null
): Promise<string> {
  await ensureProfileSavedOnServer();

  const prepared = await prepareImageForUpload(localUri, "avatar");
  const downloadURL = await uploadFileToStorage(
    `profiles/${userId}/avatar.jpg`,
    prepared.uri,
    prepared.contentType,
    prepared.sizeBytes
  );

  const response = await fetchApi(`${getApiBaseUrl()}/api/profile/me/photo`, {
    method: "PATCH",
    timeoutMs: 15_000,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoURL: downloadURL }),
  });

  const data = (await response.json()) as UpdatePhotoApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Profil fotoğrafı kaydedilemedi");
  }

  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { photoURL: downloadURL });
  }

  return downloadURL;
}
