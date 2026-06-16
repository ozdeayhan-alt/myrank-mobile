import { doc } from "firebase/firestore";
import { readFirestoreDoc } from "@/lib/firebase/readFirestoreDoc";
import { getFirestoreDb } from "@/lib/firebase";
import { parseProfileFields, type ParsedProfileFields } from "./profileDocParsing";

const PUBLIC_PROFILES_COLLECTION = "publicProfiles";

export type PublicProfile = ParsedProfileFields;

export async function getPublicProfile(
  userId: string
): Promise<PublicProfile | null> {
  const snapshot = await readFirestoreDoc(
    doc(getFirestoreDb(), PUBLIC_PROFILES_COLLECTION, userId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return parseProfileFields(snapshot.data() as Record<string, unknown>);
}
