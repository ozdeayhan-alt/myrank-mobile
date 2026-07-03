import { Alert, Linking, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

function canUseAndroidPhotoPickerWithoutPermission(): boolean {
  return Platform.OS === "android" && Platform.Version >= 33;
}

function showPermissionAlert(message: string): void {
  Alert.alert("İzin gerekli", message, [
    { text: "Vazgeç", style: "cancel" },
    {
      text: "Ayarlara git",
      onPress: () => {
        void Linking.openSettings();
      },
    },
  ]);
}

export async function requestMediaLibraryPermission(): Promise<boolean> {
  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (result.granted) {
    return true;
  }

  if (canUseAndroidPhotoPickerWithoutPermission()) {
    return true;
  }

  showPermissionAlert(
    "Galeriye erişim izni vermeniz gerekiyor. Ayarlardan MyRank → İzinler → Dosyalar ve medya (veya Fotoğraflar) bölümünden izin verebilirsiniz."
  );
  return false;
}

export async function requestCameraPermission(): Promise<boolean> {
  const existing = await ImagePicker.getCameraPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  const result = await ImagePicker.requestCameraPermissionsAsync();
  if (result.granted) {
    return true;
  }

  showPermissionAlert(
    "Kamera erişim izni vermeniz gerekiyor. Ayarlardan MyRank → İzinler → Kamera bölümünden izin verebilirsiniz."
  );
  return false;
}

export async function pickImageFromLibrary(
  options?: Partial<ImagePicker.ImagePickerOptions>
): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestMediaLibraryPermission())) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    ...options,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

export async function pickImageFromCamera(
  options?: Partial<ImagePicker.ImagePickerOptions>
): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestCameraPermission())) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    ...options,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

export function showMediaSourcePicker(
  onSelect: (asset: ImagePicker.ImagePickerAsset) => void,
  options?: { title?: string }
): void {
  Alert.alert(options?.title ?? "Fotoğraf ekle", "Kaynak seçin", [
    {
      text: "Kamera",
      onPress: () => {
        void (async () => {
          const asset = await pickImageFromCamera({ allowsEditing: false });
          if (asset) {
            onSelect(asset);
          }
        })();
      },
    },
    {
      text: "Galeri",
      onPress: () => {
        void (async () => {
          const asset = await pickImageFromLibrary({ allowsEditing: false });
          if (asset) {
            onSelect(asset);
          }
        })();
      },
    },
    { text: "Vazgeç", style: "cancel" },
  ]);
}
