import { getFirebaseAuth } from "@/lib/firebase";
import { isMetadataComplete } from "../types";
import { getProfile } from "./getProfile";
import { getPublicProfile } from "./getPublicProfile";
import type { ParsedProfileFields } from "./profileDocParsing";

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForAuthToken(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    return;
  }
  await user.getIdToken();
}

async function fetchOnce(userId: string): Promise<ParsedProfileFields | null> {
  const fromUsers = await getProfile(userId);
  if (fromUsers) {
    return fromUsers;
  }

  return getPublicProfile(userId);
}

/**
 * users + publicProfiles yedekli, token hazır olunca retry ile profil okur.
 */
export async function fetchRemoteProfile(
  userId: string
): Promise<ParsedProfileFields | null> {
  await waitForAuthToken();

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const profile = await fetchOnce(userId);
      if (profile) {
        return profile;
      }
      return null;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS - 1) {
        await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
      }
    }
  }

  if (__DEV__ && lastError) {
    console.warn("fetchRemoteProfile failed after retries", lastError);
  }

  try {
    return await getPublicProfile(userId);
  } catch {
    return null;
  }
}

export function pickProfileMetadata(
  local: ParsedProfileFields["metadata"],
  remote: ParsedProfileFields["metadata"]
): ParsedProfileFields["metadata"] {
  if (isMetadataComplete(remote)) {
    return remote;
  }
  if (isMetadataComplete(local)) {
    return local;
  }
  return remote;
}
