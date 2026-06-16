import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfileMenuStore } from "@/features/profile/store/useProfileMenuStore";

export function ProfileHeaderButton() {
  const openMenu = useProfileMenuStore((s) => s.openMenu);

  return (
    <Pressable
      className="pb-2 pl-2 pt-0"
      onPress={openMenu}
      accessibilityLabel="Profil menüsü"
    >
      <Ionicons name="menu" size={26} color="#374151" />
    </Pressable>
  );
}
