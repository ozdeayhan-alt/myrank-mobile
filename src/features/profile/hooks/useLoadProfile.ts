import { useEffect, useRef } from "react";
import { shouldRefreshAvatarFromProfile } from "@/lib/media/normalizeAvatarUrl";
import { ensureRankingEntries } from "../api/ensureRankingEntries";
import {
  fetchRemoteProfile,
  pickProfileMetadata,
} from "../api/fetchRemoteProfile";
import type { ParsedProfileFields } from "../api/profileDocParsing";
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
  useProfileStore.setState({ profileOwnerId: userId, isRemoteLoaded: true });
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
  const photoURL = pickProfilePhotoURL(
    remote.photoURL,
    local.photoURL,
    authPhotoURL
  );

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
        applyCachedProfile(userId, displayName, photoURL);
      } else if (displayName?.trim() || photoURL?.trim()) {
        applyAuthBootstrap(userId, displayName, photoURL);
      } else {
        setRemoteLoaded(false);
      }

      const remote = await fetchRemoteProfile(userId);
      if (cancelled) {
        return;
      }

      if (remote) {
        applyRemoteProfile(userId, remote.profile, displayName, photoURL);
        const savedOnServer =
          remote.fromUsers && isMetadataComplete(remote.profile.metadata);
        useProfileStore.getState().setProfileSavedOnServer(savedOnServer);
        return;
      }

      useProfileStore.getState().setProfileSavedOnServer(false);

      if (hadCachedProfile) {
        setRemoteLoaded(true);
        return;
      }

      if (displayName?.trim()) {
        setDisplayName(displayName.trim());
      }
      if (photoURL?.trim()) {
        setPhotoURL(photoURL.trim());
      }

      const local = useProfileStore.getState();
      if (isMetadataComplete(local.metadata) && local.profileOwnerId === userId) {
        applyCachedProfile(userId, displayName, photoURL);
        return;
      }

      setRemoteLoaded(true);
      useProfileStore.setState({ profileOwnerId: userId });
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, setDisplayName, setPhotoURL, setRemoteLoaded, reset]);
}
