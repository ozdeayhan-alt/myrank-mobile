import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

type DuelCoverImageProps = {
  uri: string;
  recyclingKey?: string;
};

/** Duel tam ekran — kenardan kenara cover, üst/alt boşluk yok. */
export function DuelCoverImage({
  uri,
  recyclingKey = "duel-cover",
}: DuelCoverImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  if (loadFailed) {
    return <View className="h-full w-full bg-neutral-900" />;
  }

  return (
    <View className="h-full w-full overflow-hidden bg-black">
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={recyclingKey}
        priority="high"
        onError={() => setLoadFailed(true)}
      />
    </View>
  );
}
