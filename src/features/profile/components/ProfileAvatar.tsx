import { memo, useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { listAvatarDisplayCandidateUrls } from "@/lib/media/resolveMediaDisplayUrl";
import {
  PRESTIGE_RING,
  type PrestigeTier,
} from "@/features/ranking/utils/prestige";

export const PROFILE_AVATAR_SIZE = 120;

const RING_WIDTH = 2;

type ProfileAvatarProps = {
  photoURL?: string | null;
  fallbackLetter?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  prestigeTier?: PrestigeTier | null;
};

function LetterAvatar({
  letter,
  size,
  style,
}: {
  letter: string;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  const borderRadius = size / 2;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
      className="items-center justify-center bg-gray-100"
    >
      <Text
        className="font-bold text-gray-700"
        style={{ fontSize: size * 0.375 }}
      >
        {letter}
      </Text>
    </View>
  );
}

function ProfileAvatarInner({
  photoURL,
  fallbackLetter = "?",
  size = PROFILE_AVATAR_SIZE,
  style,
  imageStyle,
  prestigeTier = null,
}: ProfileAvatarProps) {
  const letter = fallbackLetter[0]?.toUpperCase() ?? "?";
  const ring = prestigeTier ? PRESTIGE_RING[prestigeTier] : null;
  const candidates = useMemo(
    () => listAvatarDisplayCandidateUrls(photoURL),
    [photoURL]
  );
  const [index, setIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    setIndex(0);
    setAllFailed(false);
  }, [candidates]);

  const displayUrl = candidates[index];
  const showImage = Boolean(displayUrl) && !allFailed;

  const avatarContent = showImage ? (
    <Image
      source={{ uri: displayUrl }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        imageStyle,
      ]}
      contentFit="cover"
      cachePolicy="memory-disk"
      recyclingKey={`${displayUrl}-${index}`}
      onError={() => {
        if (index + 1 < candidates.length) {
          setIndex((current) => current + 1);
          return;
        }
        setAllFailed(true);
      }}
    />
  ) : (
    <LetterAvatar letter={letter} size={size} style={style} />
  );

  if (!ring) {
    return avatarContent;
  }

  const outerSize = size + RING_WIDTH * 2;

  return (
    <View
      style={[
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          borderWidth: RING_WIDTH,
          borderColor: ring.border,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: ring.glow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
    >
      {avatarContent}
    </View>
  );
}

export const ProfileAvatar = memo(ProfileAvatarInner);
