import { doc } from "firebase/firestore";
import { readFirestoreDocFromServer } from "@/lib/firebase/readFirestoreDoc";
import { getFirestoreDb } from "@/lib/firebase";
import { EMPTY_METADATA, type UserMetadata } from "../types";
import {
  parseProfileFields,
  type ParsedProfileFields,
} from "./profileDocParsing";

const USERS_COLLECTION = "users";

export type LoadedProfile = ParsedProfileFields;

export async function getProfile(userId: string): Promise<LoadedProfile | null> {
  const snapshot = await readFirestoreDocFromServer(
    doc(getFirestoreDb(), USERS_COLLECTION, userId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return parseProfileFields(snapshot.data() as Record<string, unknown>);
}

export function getEmptyMetadata(): UserMetadata {
  return { ...EMPTY_METADATA };
}
