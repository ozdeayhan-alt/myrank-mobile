import { Image } from "expo-image";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type StoryPhotoDisplayProps = {
  uri: string;
  style?: StyleProp<ViewStyle>;
};

/** Story foto — tam görünür (contain), Instagram tarzı blur arka plan. */
export function StoryPhotoDisplay({ uri, style }: StoryPhotoDisplayProps) {
  return (
    <View style={[styles.root, style]}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        blurRadius={42}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject} className="bg-black/40" />
      <Image source={{ uri }} style={styles.foreground} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  foreground: {
    width: "100%",
    height: "100%",
  },
});
