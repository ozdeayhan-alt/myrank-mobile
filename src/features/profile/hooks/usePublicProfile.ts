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
  if (remote?.displayName.trim()) return remote.displayName.trim();
  if (displayNameFallback?.trim()) return displayNameFallback.trim();
  return userId ? `Kullanıcı ${userId.slice(0, 6)}` : DEFAULT_DISPLAY_NAME;
}

function resolvePhotoURL(
  remote: PublicProfile | null | undefined,
  photoURLFallback?: string
): string {
  if (remote?.photoURL.trim()) return remote.photoURL.trim();
  return photoURLFallback?.trim() ?? "";
}

export function usePublicProfile(
  userId: string,
  fallbacks: PublicProfileFallbacks = {}
) {
  const displayNameFallback = fallbacks.displayName;
  const photoURLFallback = fallbacks.photoURL;

  const query = useQuery({
    queryKey: publicProfileQueryKey(userId),
    queryFn: () => getPublicProfile(userId),
    enabled: Boolean(userId),
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
