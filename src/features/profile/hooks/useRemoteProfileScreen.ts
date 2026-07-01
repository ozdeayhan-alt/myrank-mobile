import { useMemo } from "react";
import {
  DEFAULT_DISPLAY_NAME,
  EMPTY_METADATA,
  resolveDisplayName,
  resolvePhotoURL,
} from "../types";
import { sanitizeUserMetadata } from "../api/profileDocParsing";
import { EMPTY_BIO_CATEGORY_VISIBILITY } from "../utils/bioCategoryVisibility";
import type { BioCategoryVisibility } from "../utils/bioCategoryVisibility";
import {
  useProfileSummary,
  useProfileSummaryStatus,
} from "./useProfileSummary";
import { usePublicProfile } from "./usePublicProfile";

type RemoteProfileFallbacks = {
  displayName?: string;
  photoURL?: string;
};

export function useRemoteProfileScreen(
  userId: string,
  fallbacks: RemoteProfileFallbacks = {}
) {
  useProfileSummary(userId, EMPTY_METADATA, Boolean(userId));
  const summaryQuery = useProfileSummaryStatus(userId);
  const summaryFailed =
    summaryQuery.isError && summaryQuery.isFetched && !summaryQuery.data;

  const publicProfile = usePublicProfile(userId, fallbacks, {
    enabled: Boolean(userId) && summaryFailed,
  });

  const apiProfile = summaryQuery.data?.profile;

  const displayName = useMemo(() => {
    const apiName = apiProfile?.displayName?.trim();
    if (apiName) {
      return apiName;
    }
    if (summaryFailed) {
      return publicProfile.displayName;
    }
    return resolveDisplayName(fallbacks.displayName, null);
  }, [
    apiProfile?.displayName,
    summaryFailed,
    publicProfile.displayName,
    fallbacks.displayName,
  ]);

  const photoURL = useMemo(() => {
    const apiPhoto = apiProfile?.photoURL?.trim();
    if (apiPhoto) {
      return resolvePhotoURL(apiPhoto, null);
    }
    if (summaryFailed) {
      return publicProfile.photoURL;
    }
    return resolvePhotoURL(fallbacks.photoURL, null);
  }, [
    apiProfile?.photoURL,
    summaryFailed,
    publicProfile.photoURL,
    fallbacks.photoURL,
  ]);

  const bio = apiProfile?.bio ?? (summaryFailed ? publicProfile.bio : "");
  const bioCategoryVisibility: BioCategoryVisibility =
    apiProfile?.bioCategoryVisibility ??
    (summaryFailed
      ? publicProfile.bioCategoryVisibility
      : EMPTY_BIO_CATEGORY_VISIBILITY);
  const metadata = useMemo(() => {
    if (apiProfile?.metadata) {
      return sanitizeUserMetadata(apiProfile.metadata);
    }
    if (summaryFailed) {
      return publicProfile.metadata;
    }
    return EMPTY_METADATA;
  }, [apiProfile?.metadata, summaryFailed, publicProfile.metadata]);
  const loadedTotalScore =
    apiProfile?.totalScore ??
    (summaryFailed ? publicProfile.totalScore : 0);

  const fatalError =
    summaryFailed &&
    Boolean(publicProfile.error) &&
    !fallbacks.displayName?.trim() &&
    !displayName.trim();

  return {
    displayName: displayName || DEFAULT_DISPLAY_NAME,
    photoURL,
    bio,
    bioCategoryVisibility,
    metadata,
    loadedTotalScore,
    fatalError: fatalError ? publicProfile.error : null,
  };
}
