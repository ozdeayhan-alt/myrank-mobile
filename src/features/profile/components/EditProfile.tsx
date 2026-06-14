import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "@/features/auth";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { pickImageFromLibrary } from "@/lib/media/pickMedia";
import { uploadProfilePhoto } from "../api/uploadProfilePhoto";
import { resolveDisplayName, resolvePhotoURL } from "../types";
import { useProfileStore } from "../store/useProfileStore";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileForm } from "./ProfileForm";

type EditProfileProps = {
  onSaved?: () => void;
};

export function EditProfile({ onSaved }: EditProfileProps) {
  const { user } = useAuth();
  const storedDisplayName = useProfileStore((s) => s.displayName);
  const storedPhotoURL = useProfileStore((s) => s.photoURL);
  const setPhotoURL = useProfileStore((s) => s.setPhotoURL);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const name = resolveDisplayName(storedDisplayName, user?.displayName);
  const photoURL = resolvePhotoURL(storedPhotoURL, user?.photoURL);

  const handleChangePhoto = async () => {
    if (!user?.uid) {
      Alert.alert("Hata", "Oturum bilgisi bulunamadı.");
      return;
    }

    const asset = await pickImageFromLibrary();
    if (!asset) return;

    setUploadingPhoto(true);
    try {
      const downloadURL = await uploadProfilePhoto(
        user.uid,
        asset.uri,
        asset.mimeType
      );
      setPhotoURL(downloadURL);
      Alert.alert("Başarılı", "Profil fotoğrafınız güncellendi.");
    } catch (error) {
      Alert.alert("Fotoğraf yüklenemedi", getUserFacingErrorMessage(error));
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="items-center border-b border-gray-100 px-6 py-6">
        <ProfileAvatar photoURL={photoURL} fallbackLetter={name} />
        <Pressable
          className={`mt-4 rounded-xl bg-gray-100 px-5 py-3 ${uploadingPhoto ? "opacity-60" : ""}`}
          onPress={handleChangePhoto}
          disabled={uploadingPhoto}
        >
          {uploadingPhoto ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text className="text-sm font-semibold text-gray-800">
              Fotoğrafı Değiştir
            </Text>
          )}
        </Pressable>
      </View>
      <ProfileForm variant="edit" onSaved={onSaved} />
    </View>
  );
}
