import { useEffect } from "react";
import { ensureRankingEntries } from "../api/ensureRankingEntries";
import {
  fetchRemoteProfile,
  pickProfileMetadata,
} from "../api/fetchRemoteProfile";
import type { ParsedProfileFields } from "../api/profileDocParsing";
import { syncPublicProfile } from "../api/syncPublicProfile";
import { isMetadataComplete } from "../types";
import { useProfileStore } from "../store/useProfileStore";

async function waitForProfileStoreHydration(): Promise<void> {
  if (useProfileStore.persist.hasHydrated()) {
    return;
  }

  await new Promise<void>((resolve) => {
    const unsub = useProfileStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

function hasCachedProfileForUser(userId: string): boolean {
  const local = useProfileStore.getState();
  return (
    local.profileOwnerId === userId &&
    (local.displayName.trim().length > 0 || isMetadataComplete(local.metadata))
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
  const photoURL = local.photoURL.trim() || authPhotoURL?.trim() || "";

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

function applyRemoteProfile(
  userId: string,
  remote: ParsedProfileFields,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
): void {
  const local = useProfileStore.getState();
  const metadata = pickProfileMetadata(local.metadata, remote.metadata);
  const displayName =
    remote.displayName.trim() ||
    local.displayName.trim() ||
    authDisplayName?.trim() ||
    "";
  const photoURL =
    remote.photoURL.trim() ||
    local.photoURL.trim() ||
    authPhotoURL?.trim() ||
    "";

  useProfileStore.getState().hydrateFromFirestore(
    metadata,
    remote.totalScore,
    displayName,
    photoURL,
    remote.bio || local.bio,
    remote.bioCategoryVisibility
  );
  useProfileStore.setState({ profileOwnerId: userId });

  void syncPublicProfile(userId, {
    displayName,
    photoURL,
    bio: remote.bio || local.bio,
    bioCategoryVisibility: remote.bioCategoryVisibility,
    metadata,
    totalScore: remote.totalScore,
  }).catch(() => undefined);

  if (isMetadataComplete(metadata)) {
    ensureRankingEntries().catch(() => undefined);
  }
}

export function useLoadProfile(
  userId: string | undefined,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
) {
  const setDisplayName = useProfileStore((s) => s.setDisplayName);
  const setPhotoURL = useProfileStore((s) => s.setPhotoURL);
  const setRemoteLoaded = useProfileStore((s) => s.setRemoteLoaded);
  const reset = useProfileStore((s) => s.reset);

  useEffect(() => {
    if (!userId) {
      reset();
      return;
    }

    let cancelled = false;

    (async () => {
      await waitForProfileStoreHydration();
      if (cancelled) {
        return;
      }

      const state = useProfileStore.getState();
      if (state.profileOwnerId && state.profileOwnerId !== userId) {
        reset();
      }

      const hadCachedProfile = hasCachedProfileForUser(userId);
      if (hadCachedProfile) {
        applyCachedProfile(userId, authDisplayName, authPhotoURL);
      } else {
        setRemoteLoaded(false);
      }

      const remote = await fetchRemoteProfile(userId);
      if (cancelled) {
        return;
      }

      if (remote) {
        applyRemoteProfile(userId, remote, authDisplayName, authPhotoURL);
        return;
      }

      if (hadCachedProfile) {
        return;
      }

      if (authDisplayName?.trim()) {
        setDisplayName(authDisplayName.trim());
      }
      if (authPhotoURL?.trim()) {
        setPhotoURL(authPhotoURL.trim());
      }

      const local = useProfileStore.getState();
      if (isMetadataComplete(local.metadata) && local.profileOwnerId === userId) {
        applyCachedProfile(userId, authDisplayName, authPhotoURL);
        return;
      }

      setRemoteLoaded(true);
      useProfileStore.setState({ profileOwnerId: userId });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    userId,
    authDisplayName,
    authPhotoURL,
    setDisplayName,
    setPhotoURL,
    setRemoteLoaded,
    reset,
  ]);
}
