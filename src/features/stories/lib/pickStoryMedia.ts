import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  pickImageFromCamera,
  pickImageFromLibrary,
  pickVideoFromCamera,
  pickVideoFromLibrary,
  requestCameraPermission,
  requestMediaLibraryPermission,
} from "@/lib/media/pickMedia";

export const STORY_VIDEO_MAX_DURATION_SECONDS = 15;

async function pickStoryImageFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestMediaLibraryPermission())) {
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  return result.assets[0];
}

async function pickStoryVideoFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestMediaLibraryPermission())) {
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    videoMaxDuration: STORY_VIDEO_MAX_DURATION_SECONDS,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  return result.assets[0];
}

async function pickStoryImageFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestCameraPermission())) {
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  return result.assets[0];
}

async function pickStoryVideoFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestCameraPermission())) {
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    videoMaxDuration: STORY_VIDEO_MAX_DURATION_SECONDS,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  return result.assets[0];
}

/** Galeriden tek seferde foto veya video seç (story composer açılışı). */
export async function pickStoryMediaAsset(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (!(await requestMediaLibraryPermission())) {
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    videoMaxDuration: STORY_VIDEO_MAX_DURATION_SECONDS,
    allowsEditing: false,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  return result.assets[0];
}

export function showStoryMediaPicker(
  onSelect: (asset: ImagePicker.ImagePickerAsset) => void
): void {
  Alert.alert("Story paylaş", "Medya seç", [
    {
      text: "Fotoğraf — Kamera",
      onPress: () => {
        void pickStoryImageFromCamera().then((asset) => {
          if (asset) onSelect(asset);
        });
      },
    },
    {
      text: "Fotoğraf — Galeri",
      onPress: () => {
        void pickStoryImageFromLibrary().then((asset) => {
          if (asset) onSelect(asset);
        });
      },
    },
    {
      text: "Video — Kamera",
      onPress: () => {
        void pickStoryVideoFromCamera().then((asset) => {
          if (asset) onSelect(asset);
        });
      },
    },
    {
      text: "Video — Galeri",
      onPress: () => {
        void pickStoryVideoFromLibrary().then((asset) => {
          if (asset) onSelect(asset);
        });
      },
    },
    { text: "Vazgeç", style: "cancel" },
  ]);
}

export function isVideoAsset(asset: ImagePicker.ImagePickerAsset): boolean {
  return asset.type === "video" || (asset.mimeType?.startsWith("video/") ?? false);
}
