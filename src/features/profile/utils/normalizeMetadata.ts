import { sanitizeUserMetadata } from "../api/profileDocParsing";
import type { UserMetadata } from "../types";

/** Canonical metadata for Firestore, rankings, and explore filters. */
export function normalizeUserMetadata(metadata: UserMetadata): UserMetadata {
  return sanitizeUserMetadata(metadata);
}
