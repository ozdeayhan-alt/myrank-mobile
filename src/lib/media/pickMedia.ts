import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export const VIDEO_MAX_DURATION_SECONDS = 33;

export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("İzin gerekli", "Galeriye erişim izni vermeniz gerekiyor.");
    return false;
  }
  return true;
}

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("İzin gerekli", "Kamera erişim izni vermeniz gerekiyor.");
    return false;
  }
  return true;
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

export async function pickVideoFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestMediaLibraryPermission())) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    videoMaxDuration: VIDEO_MAX_DURATION_SECONDS,
    quality: 0.8,
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

export async function pickVideoFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestCameraPermission())) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    videoMaxDuration: VIDEO_MAX_DURATION_SECONDS,
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

export type MediaPickMode = "image" | "video";

export function showMediaSourcePicker(
  mode: MediaPickMode,
  onSelect: (asset: ImagePicker.ImagePickerAsset) => void
): void {
  const isImage = mode === "image";

  Alert.alert(
    isImage ? "Fotoğraf ekle" : "Video ekle",
    "Kaynak seçin",
    [
      {
        text: "Kamera",
        onPress: () => {
          void (async () => {
            const asset = isImage
              ? await pickImageFromCamera({ allowsEditing: false })
              : await pickVideoFromCamera();
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
            const asset = isImage
              ? await pickImageFromLibrary({ allowsEditing: false })
              : await pickVideoFromLibrary();
            if (asset) {
              onSelect(asset);
            }
          })();
        },
      },
      { text: "Vazgeç", style: "cancel" },
    ]
  );
}
