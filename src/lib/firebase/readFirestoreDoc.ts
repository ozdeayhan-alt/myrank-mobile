import {
  getDoc,
  getDocFromServer,
  type DocumentReference,
  type DocumentSnapshot,
} from "firebase/firestore";

/** Önce sunucu; offline veya hata durumunda yerel önbellek. */
export async function readFirestoreDoc<T>(
  ref: DocumentReference<T>
): Promise<DocumentSnapshot<T>> {
  try {
    return await getDocFromServer(ref);
  } catch {
    return await getDoc(ref);
  }
}
