import { getFirebaseAuth } from "@/lib/firebase";
import { isMetadataComplete } from "../types";
import { getProfile } from "./getProfile";
import { getPublicProfile } from "./getPublicProfile";
import type { ParsedProfileFields } from "./profileDocParsing";

const MAX_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 400;
const FETCH_TIMEOUT_MS = 10_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

async function waitForAuthToken(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    return;
  }
  await user.getIdToken();
}

async function fetchOnce(
  userId: string
): Promise<{ profile: ParsedProfileFields; fromUsers: boolean } | null> {
  const fromUsers = await getProfile(userId);
  if (fromUsers) {
    return { profile: fromUsers, fromUsers: true };
  }

  const fromPublic = await getPublicProfile(userId);
  if (fromPublic) {
    return { profile: fromPublic, fromUsers: false };
  }

  return null;
}

export type RemoteProfileResult = {
  profile: ParsedProfileFields;
  fromUsers: boolean;
};

/**
 * users + publicProfiles yedekli, token hazır olunca retry ile profil okur.
 */
export async function fetchRemoteProfile(
  userId: string
): Promise<RemoteProfileResult | null> {
  await waitForAuthToken();

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await withTimeout(fetchOnce(userId), FETCH_TIMEOUT_MS);
      if (result) {
        return result;
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
    const fromPublic = await withTimeout(getPublicProfile(userId), FETCH_TIMEOUT_MS);
    if (fromPublic) {
      return { profile: fromPublic, fromUsers: false };
    }
    return null;
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
