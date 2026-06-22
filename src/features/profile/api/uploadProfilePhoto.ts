import { prepareImageForUpload } from "@/lib/media/prepareImageForUpload";
import { uploadFileToStorage } from "@/lib/media/uploadToStorage";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import { useProfileStore } from "../store/useProfileStore";
import { ensureProfileSavedOnServer } from "./ensureProfileSavedOnServer";
import { syncPublicProfile } from "./syncPublicProfile";

const USERS_COLLECTION = "users";

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

  const db = getFirestoreDb();
  await setDoc(
    doc(db, USERS_COLLECTION, userId),
    { photoURL: downloadURL },
    { merge: true }
  );

  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { photoURL: downloadURL });
  }

  const state = useProfileStore.getState();
  if (state.metadata && state.displayName.trim()) {
    await syncPublicProfile(userId, {
      displayName: state.displayName,
      photoURL: downloadURL,
      bio: state.bio,
      bioCategoryVisibility: state.bioCategoryVisibility,
      metadata: state.metadata,
      totalScore: state.totalScore,
    }).catch(() => undefined);
  }

  return downloadURL;
}
