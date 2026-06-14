import { useEffect } from "react";
import { ensureRankingEntries } from "../api/ensureRankingEntries";
import {
  fetchRemoteProfile,
  pickProfileMetadata,
} from "../api/fetchRemoteProfile";
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

export function useLoadProfile(
  userId: string | undefined,
  authDisplayName?: string | null,
  authPhotoURL?: string | null
) {
  const hydrateFromFirestore = useProfileStore((s) => s.hydrateFromFirestore);
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

      setRemoteLoaded(false);

      const remote = await fetchRemoteProfile(userId);
      if (cancelled) {
        return;
      }

      const local = useProfileStore.getState();

      if (remote) {
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

        hydrateFromFirestore(
          metadata,
          remote.totalScore,
          displayName,
          photoURL,
          remote.bio || local.bio,
          remote.bioCategoryVisibility
        );
        useProfileStore.setState({ profileOwnerId: userId });

        await syncPublicProfile(userId, {
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
        return;
      }

      if (authDisplayName?.trim()) {
        setDisplayName(authDisplayName.trim());
      }
      if (authPhotoURL?.trim()) {
        setPhotoURL(authPhotoURL.trim());
      }

      if (isMetadataComplete(local.metadata) && local.profileOwnerId === userId) {
        hydrateFromFirestore(
          local.metadata,
          local.totalScore,
          local.displayName,
          local.photoURL,
          local.bio,
          local.bioCategoryVisibility
        );
        useProfileStore.setState({ profileOwnerId: userId });
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
    hydrateFromFirestore,
    setDisplayName,
    setPhotoURL,
    setRemoteLoaded,
    reset,
  ]);
}
