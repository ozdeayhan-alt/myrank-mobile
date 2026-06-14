import { Image } from "expo-image";
import { Text, View } from "react-native";
import { NotificationBellButton } from "./NotificationBellButton";

const logoSource = require("../../assets/myranklogoyeni.png");

const LOGO_SIZE = 40;
const SIDE_SLOT_WIDTH = 44;

export function HomeFeedHeader() {
  return (
    <View className="mb-1 flex-row items-center px-0 pb-1 pt-0.5">
      <View
        className="items-center justify-center"
        style={{ width: SIDE_SLOT_WIDTH, height: LOGO_SIZE }}
      >
        <Image
          source={logoSource}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          contentFit="contain"
        />
      </View>

      <Text className="flex-1 text-center text-lg font-semibold tracking-tight text-gray-900">
        Sıralamaya Girenler
      </Text>

      <View
        className="items-end justify-center"
        style={{ width: SIDE_SLOT_WIDTH, height: LOGO_SIZE }}
      >
        <NotificationBellButton />
      </View>
    </View>
  );
}
