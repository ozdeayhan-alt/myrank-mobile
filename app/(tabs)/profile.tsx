import { useEffect, useState } from "react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import {
  EditProfile,
  ProfileForm,
  ProfileView,
  isMetadataComplete,
  useProfileStore,
} from "@/features/profile";
import { ProfileLoadingSkeleton } from "@/features/profile/components/ProfileLoadingSkeleton";
import { useProfileMenuStore } from "@/features/profile/store/useProfileMenuStore";

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const metadata = useProfileStore((s) => s.metadata);
  const isProfileBootstrapSettled = useProfileStore(
    (s) => s.isProfileBootstrapSettled
  );
  const profileSavedOnServer = useProfileStore((s) => s.profileSavedOnServer);
  const setEditHandler = useProfileMenuStore((s) => s.setEditHandler);

  const complete = isMetadataComplete(metadata);
  const profileReady = complete && profileSavedOnServer;

  useEffect(() => {
    setEditHandler(() => setEditing(true));
    return () => setEditHandler(null);
  }, [setEditHandler]);

  if (!isProfileBootstrapSettled) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <ProfileLoadingSkeleton />
      </TabScreenSafeArea>
    );
  }

  if (editing) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <EditProfile
          onSaved={() => {
            setEditing(false);
          }}
        />
      </TabScreenSafeArea>
    );
  }

  if (!profileReady) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <ProfileForm
          onSaved={() => {
            setEditing(false);
          }}
        />
      </TabScreenSafeArea>
    );
  }

  return (
    <TabScreenSafeArea className="flex-1 bg-white">
      <ProfileView />
      <ProfileMenu />
    </TabScreenSafeArea>
  );
}
