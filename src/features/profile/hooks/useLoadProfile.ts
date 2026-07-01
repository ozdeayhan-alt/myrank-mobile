import { useEffect, useRef } from "react";
import { shouldRefreshAvatarFromProfile } from "@/lib/media/normalizeAvatarUrl";
import { ensureRankingEntriesIfNeeded } from "../api/ensureRankingEntriesIfNeeded";
import {
  fetchRemoteProfile,
  pickProfileMetadata,
} from "../api/fetchRemoteProfile";
import type { ParsedProfileFields } from "../api/profileDocParsing";
import { ensureProfileSavedOnServer } from "../api/ensureProfileSavedOnServer";
import { syncPublicProfile } from "../api/syncPublicProfile";
import { isMetadataComplete } from "../types";
import { useProfileStore } from "../store/useProfileStore";

const HYDRATION_TIMEOUT_MS = 2500;

function pickProfilePhotoURL(
  remote: string,
  local: string,
  authPhotoURL?: string | null
): string {
  const remoteTrim = remote.trim();
  const localTrim = local.trim();
  const authTrim = authPhotoURL?.trim() ?? "";

  if (remoteTrim) {
    return remoteTrim;
  }
  if (localTrim && !shouldRefreshAvatarFromProfile(localTrim)) {
    return localTrim;
  }
  if (authTrim) {
    return authTrim;
  }
  return localTrim;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForProfileStoreHydration(): Promise<void> {
  if (useProfileStore.persist.hasHydrated()) {
    return;
  }

  await Promise.race([
    new Promise<void>((resolve) => {
      const unsub = useProfileStore.persist.onFinishHydration(() => {
        unsub();
        resolve();
      });
    }),
    delay(HYDRATION_TIMEOUT_MS),
  ]);
}

function hasCachedProfileForUser(userId: string): boolean {
  const local = useProfileStore.getState();
  if (local.profileOwnerId !== userId) {
    return false;
  }

  return isMetadataComplete(local.metadata);
}

function hasCachedDisplayIdentity(userId: string): boolean {
  const local = useProfileStore.getState();
  if (local.profileOwnerId !== userId) {
    return false;
  }

  return local.displayName.trim().length > 0 || local.photoURL.trim().length > 0;
}

function isCachedProfileReady(userId: string): boolean {
  const local = useProfileStore.getState();
  return (
    local.profileOwnerId === userId &&
    isMetadataComplete(local.metadata) &&
    local.profileSavedOnServer
  );
}

function applyCachedProfile(
  userId: string,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
): void {
  const local = useProfileStore.getState();
  const displayName =
    local.displayName.trim() || authDisplayName?.trim() || "";
  const photoURL = pickProfilePhotoURL("", local.photoURL, authPhotoURL);

  useProfileStore.getState().hydrateFromFirestore(
    local.metadata,
    local.totalScore,
    displayName,
    photoURL,
    local.bio,
    local.bioCategoryVisibility
  );
  useProfileStore.setState({ profileOwnerId: userId });
}

function applyAuthBootstrap(
  userId: string,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
): void {
  const local = useProfileStore.getState();
  const displayName =
    local.displayName.trim() || authDisplayName?.trim() || "";
  const photoURL = pickProfilePhotoURL("", local.photoURL, authPhotoURL);

  useProfileStore.getState().hydrateFromFirestore(
    local.metadata,
    local.totalScore,
    displayName,
    photoURL,
    local.bio,
    local.bioCategoryVisibility
  );
  useProfileStore.setState({ profileOwnerId: userId });
}

function remoteProfileDiffersFromLocal(
  remote: ParsedProfileFields,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
): boolean {
  const local = useProfileStore.getState();
  const metadata = pickProfileMetadata(local.metadata, remote.metadata);
  const displayName =
    remote.displayName.trim() ||
    local.displayName.trim() ||
    authDisplayName?.trim() ||
    "";
  const photoURL = pickProfilePhotoURL(
    remote.photoURL,
    local.photoURL,
    authPhotoURL
  );
  const bio = remote.bio || local.bio;

  return (
    local.displayName.trim() !== displayName ||
    local.photoURL.trim() !== photoURL.trim() ||
    local.bio.trim() !== bio.trim() ||
    JSON.stringify(local.bioCategoryVisibility) !==
      JSON.stringify(
        remote.bioCategoryVisibility ?? local.bioCategoryVisibility
      ) ||
    JSON.stringify(local.metadata) !== JSON.stringify(metadata)
  );
}

function applyRemoteProfile(
  userId: string,
  remote: ParsedProfileFields,
  authDisplayName?: string | null,
  authPhotoURL?: string | null,
  options: { syncPublic?: boolean } = {}
): void {
  const { syncPublic = true } = options;
  const local = useProfileStore.getState();
  const metadata = pickProfileMetadata(local.metadata, remote.metadata);
  const displayName =
    remote.displayName.trim() ||
    local.displayName.trim() ||
    authDisplayName?.trim() ||
    "";
  const photoURL = pickProfilePhotoURL(
    remote.photoURL,
    local.photoURL,
    authPhotoURL
  );

  const shouldSyncPublic =
    syncPublic && remoteProfileDiffersFromLocal(remote, authDisplayName, authPhotoURL);

  useProfileStore.getState().hydrateFromFirestore(
    metadata,
    remote.totalScore,
    displayName,
    photoURL,
    remote.bio || local.bio,
    remote.bioCategoryVisibility
  );
  useProfileStore.setState({ profileOwnerId: userId });

  if (shouldSyncPublic) {
    void syncPublicProfile(userId, {
      displayName,
      photoURL,
      bio: remote.bio || local.bio,
      bioCategoryVisibility: remote.bioCategoryVisibility,
      metadata,
      totalScore: remote.totalScore,
    }).catch(() => undefined);
  }

  if (isMetadataComplete(metadata)) {
    ensureRankingEntriesIfNeeded().catch(() => undefined);
  }
}

async function reconcileProfileSavedOnServer(
  remote: { fromUsers: boolean; profile: ParsedProfileFields } | null,
  hadCachedProfile: boolean
): Promise<void> {
  const local = useProfileStore.getState();
  const localComplete = isMetadataComplete(local.metadata);

  if (local.profileSavedOnServer) {
    return;
  }

  if (remote) {
    const remoteComplete = isMetadataComplete(remote.profile.metadata);
    if (remote.fromUsers && remoteComplete) {
      useProfileStore.getState().setProfileSavedOnServer(true);
      return;
    }
    if (remoteComplete || localComplete) {
      try {
        await ensureProfileSavedOnServer();
      } catch {
        useProfileStore.getState().setProfileSavedOnServer(false);
      }
      return;
    }
    useProfileStore.getState().setProfileSavedOnServer(false);
    return;
  }

  if (hadCachedProfile && localComplete) {
    try {
      await ensureProfileSavedOnServer();
    } catch {
      useProfileStore.getState().setProfileSavedOnServer(false);
    }
    return;
  }

  useProfileStore.getState().setProfileSavedOnServer(false);
}

async function syncProfileSavedStateBeforeBootstrapEnd(
  userId: string
): Promise<void> {
  const local = useProfileStore.getState();
  if (local.profileOwnerId !== userId || local.profileSavedOnServer) {
    return;
  }
  if (!isMetadataComplete(local.metadata)) {
    return;
  }

  try {
    await ensureProfileSavedOnServer();
  } catch {
    useProfileStore.getState().setProfileSavedOnServer(false);
  }
}

async function reconcileRemoteProfile(
  userId: string,
  hadCachedProfile: boolean,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
): Promise<void> {
  const remote = await fetchRemoteProfile(userId);

  if (remote) {
    applyRemoteProfile(userId, remote.profile, authDisplayName, authPhotoURL);
    await reconcileProfileSavedOnServer(remote, hadCachedProfile);
    await syncProfileSavedStateBeforeBootstrapEnd(userId);
    return;
  }

  await reconcileProfileSavedOnServer(null, hadCachedProfile);

  if (hadCachedProfile) {
    await syncProfileSavedStateBeforeBootstrapEnd(userId);
    return;
  }

  const displayName = authDisplayName?.trim();
  const photoURL = authPhotoURL?.trim();
  if (displayName) {
    useProfileStore.getState().setDisplayName(displayName);
  }
  if (photoURL) {
    useProfileStore.getState().setPhotoURL(photoURL);
  }

  const local = useProfileStore.getState();
  if (isMetadataComplete(local.metadata) && local.profileOwnerId === userId) {
    applyCachedProfile(userId, authDisplayName, authPhotoURL);
  }

  await syncProfileSavedStateBeforeBootstrapEnd(userId);
}

export function useLoadProfile(
  userId: string | undefined,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
) {
  const reset = useProfileStore((s) => s.reset);

  const authDisplayNameRef = useRef(authDisplayName);
  const authPhotoURLRef = useRef(authPhotoURL);
  authDisplayNameRef.current = authDisplayName;
  authPhotoURLRef.current = authPhotoURL;

  useEffect(() => {
    if (!userId) {
      reset();
      return;
    }

    let cancelled = false;
    const displayName = authDisplayNameRef.current;
    const photoURL = authPhotoURLRef.current;

    useProfileStore.getState().beginProfileBootstrap();

    (async () => {
      try {
        await waitForProfileStoreHydration();
        if (cancelled) {
          return;
        }

        const state = useProfileStore.getState();
        if (state.profileOwnerId && state.profileOwnerId !== userId) {
          reset();
          useProfileStore.getState().beginProfileBootstrap();
        }

        const hadCachedProfile = hasCachedProfileForUser(userId);
        const hadCachedIdentity = hasCachedDisplayIdentity(userId);
        const cachedReady = isCachedProfileReady(userId);

        if (hadCachedProfile) {
          applyCachedProfile(userId, displayName, photoURL);
        } else if (hadCachedIdentity || displayName?.trim() || photoURL?.trim()) {
          applyAuthBootstrap(userId, displayName, photoURL);
        } else {
          useProfileStore.setState({ profileOwnerId: userId });
        }

        if (cachedReady) {
          useProfileStore.getState().finishProfileBootstrap();
          if (!cancelled) {
            void reconcileRemoteProfile(
              userId,
              hadCachedProfile,
              displayName,
              photoURL
            );
          }
          return;
        }

        await reconcileRemoteProfile(
          userId,
          hadCachedProfile,
          displayName,
          photoURL
        );
      } finally {
        if (!cancelled) {
          useProfileStore.getState().finishProfileBootstrap();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, reset]);
}
