import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicProfile, type PublicProfile } from "../api/getPublicProfile";
import { DEFAULT_DISPLAY_NAME, EMPTY_METADATA } from "../types";
import { EMPTY_BIO_CATEGORY_VISIBILITY } from "../utils/bioCategoryVisibility";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export const publicProfileQueryKey = (userId: string) =>
  ["profile", "public", userId] as const;

type PublicProfileFallbacks = {
  displayName?: string;
  photoURL?: string;
};

function resolveDisplayName(
  userId: string,
  remote: PublicProfile | null | undefined,
  displayNameFallback?: string
): string {
  const remoteName = remote?.displayName?.trim();
  if (remoteName) return remoteName;
  if (displayNameFallback?.trim()) return displayNameFallback.trim();
  return userId ? `Kullanıcı ${userId.slice(0, 6)}` : DEFAULT_DISPLAY_NAME;
}

function resolvePhotoURL(
  remote: PublicProfile | null | undefined,
  photoURLFallback?: string
): string {
  const remotePhoto = remote?.photoURL?.trim();
  if (remotePhoto) return remotePhoto;
  return photoURLFallback?.trim() ?? "";
}

type UsePublicProfileOptions = {
  enabled?: boolean;
};

export function usePublicProfile(
  userId: string,
  fallbacks: PublicProfileFallbacks = {},
  options: UsePublicProfileOptions = {}
) {
  const displayNameFallback = fallbacks.displayName;
  const photoURLFallback = fallbacks.photoURL;
  const queryEnabled = options.enabled ?? true;

  const query = useQuery({
    queryKey: publicProfileQueryKey(userId),
    queryFn: () => getPublicProfile(userId),
    enabled: Boolean(userId) && queryEnabled,
    staleTime: 60_000,
  });

  const displayName = useMemo(
    () => resolveDisplayName(userId, query.data, displayNameFallback),
    [userId, query.data, displayNameFallback]
  );

  const photoURL = useMemo(
    () => resolvePhotoURL(query.data, photoURLFallback),
    [query.data, photoURLFallback]
  );

  const loading = query.isLoading && query.data === undefined;
  const error = query.error ? getUserFacingErrorMessage(query.error) : null;

  return {
    displayName,
    photoURL,
    bio: query.data?.bio ?? "",
    bioCategoryVisibility:
      query.data?.bioCategoryVisibility ?? EMPTY_BIO_CATEGORY_VISIBILITY,
    totalScore: query.data?.totalScore ?? 0,
    metadata: query.data?.metadata ?? EMPTY_METADATA,
    loading,
    error,
    refetch: query.refetch,
  };
}
