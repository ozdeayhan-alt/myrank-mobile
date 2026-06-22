import {
  getDoc,
  getDocFromCache,
  getDocFromServer,
  type DocumentReference,
  type DocumentSnapshot,
} from "firebase/firestore";

/** Profil gibi kritik okumalar — sunucu öncelikli, offline'da cache/getDoc. */
export async function readFirestoreDocFromServer<T>(
  ref: DocumentReference<T>
): Promise<DocumentSnapshot<T>> {
  try {
    return await getDocFromServer(ref);
  } catch {
    try {
      return await getDoc(ref);
    } catch {
      return await getDocFromCache(ref);
    }
  }
}

/** Önbellek varsa hızlı döner; yoksa sunucu. Profil okumaları için kullanmayın. */
export async function readFirestoreDoc<T>(
  ref: DocumentReference<T>
): Promise<DocumentSnapshot<T>> {
  try {
    const cached = await getDocFromCache(ref);
    if (cached.exists()) {
      return cached;
    }
  } catch {
    // Önbellekte yok veya henüz hazır değil.
  }

  try {
    return await getDocFromServer(ref);
  } catch {
    return await getDoc(ref);
  }
}
