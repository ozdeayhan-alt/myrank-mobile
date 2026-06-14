import { useAuth } from "@/features/auth";
import { resolveDisplayName, resolvePhotoURL } from "../types";
import { useProfileStore } from "../store/useProfileStore";
import { ProfileContent } from "./ProfileContent";

export function ProfileView() {
  const { user } = useAuth();
  const storedDisplayName = useProfileStore((s) => s.displayName);
  const storedPhotoURL = useProfileStore((s) => s.photoURL);
  const bio = useProfileStore((s) => s.bio);
  const bioCategoryVisibility = useProfileStore((s) => s.bioCategoryVisibility);
  const metadata = useProfileStore((s) => s.metadata);
  const name = resolveDisplayName(storedDisplayName, user?.displayName);
  const photoURL = resolvePhotoURL(storedPhotoURL, user?.photoURL);

  if (!user?.uid) {
    return null;
  }

  return (
    <ProfileContent
      userId={user.uid}
      displayName={name}
      photoURL={photoURL}
      bio={bio}
      bioCategoryVisibility={bioCategoryVisibility}
      loadedTotalScore={0}
      metadata={metadata}
      isOwnProfile
    />
  );
}
