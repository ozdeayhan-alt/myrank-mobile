import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfileMenuStore } from "@/features/profile/store/useProfileMenuStore";

export function ProfileHeaderButton() {
  const openMenu = useProfileMenuStore((s) => s.openMenu);

  return (
    <Pressable
      className="p-2"
      onPress={openMenu}
      accessibilityLabel="Profil menüsü"
    >
      <Ionicons name="menu" size={26} color="#374151" />
    </Pressable>
  );
}
