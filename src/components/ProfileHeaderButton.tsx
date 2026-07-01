import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProfileMenuStore } from "@/features/profile/store/useProfileMenuStore";

export function ProfileHeaderButton() {
  const openMenu = useProfileMenuStore((s) => s.openMenu);

  return (
    <Pressable
      className="px-1 pb-2 pt-0"
      onPress={openMenu}
      accessibilityLabel="Profil menüsü"
    >
      <Ionicons name="menu" size={26} color="#374151" />
    </Pressable>
  );
}
