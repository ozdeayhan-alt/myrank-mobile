import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { parseProfileFields, type ParsedProfileFields } from "./profileDocParsing";

const PUBLIC_PROFILES_COLLECTION = "publicProfiles";

export type PublicProfile = ParsedProfileFields;

export async function getPublicProfile(
  userId: string
): Promise<PublicProfile | null> {
  const snapshot = await getDoc(
    doc(getFirestoreDb(), PUBLIC_PROFILES_COLLECTION, userId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return parseProfileFields(snapshot.data() as Record<string, unknown>);
}
