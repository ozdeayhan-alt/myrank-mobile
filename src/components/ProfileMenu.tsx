import { useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth";
import { useProfileMenuStore } from "@/features/profile/store/useProfileMenuStore";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

type MenuItemProps = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  bordered?: boolean;
};

function MenuItem({
  label,
  onPress,
  destructive = false,
  bordered = true,
}: MenuItemProps) {
  return (
    <Pressable
      className={`px-5 py-4 ${bordered ? "border-b border-gray-100" : ""}`}
      onPress={onPress}
    >
      <Text
        className={`text-base ${destructive ? "font-semibold text-red-600" : "text-gray-900"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ProfileMenu() {
  const router = useRouter();
  const { signOut, deleteAccount } = useAuth();
  const menuOpen = useProfileMenuStore((s) => s.menuOpen);
  const closeMenu = useProfileMenuStore((s) => s.closeMenu);
  const editHandler = useProfileMenuStore((s) => s.editHandler);
  const [deleting, setDeleting] = useState(false);

  const navigate = (path: "/legal/privacy" | "/legal/terms" | "/legal/moderation" | "/saved") => {
    closeMenu();
    router.push(path);
  };

  const handleEdit = () => {
    closeMenu();
    editHandler?.();
  };

  const confirmDeleteAccount = () => {
    closeMenu();
    Alert.alert(
      "Hesabı sil",
      "Hesabınız, gönderileriniz, mesajlarınız ve profil verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: () => {
            setDeleting(true);
            void (async () => {
              try {
                await deleteAccount();
                Alert.alert("Hesap silindi", "Hesabınız başarıyla silindi.");
              } catch (error) {
                Alert.alert("Silinemedi", getUserFacingErrorMessage(error));
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent
        onRequestClose={closeMenu}
      >
        <Pressable className="flex-1 bg-black/40" onPress={closeMenu}>
          <View className="absolute right-4 top-14 min-w-[240px] overflow-hidden rounded-2xl bg-white shadow-lg">
            <MenuItem label="Profili Düzenle" onPress={handleEdit} />
            <MenuItem label="Kaydedilenler" onPress={() => navigate("/saved")} />
            <MenuItem
              label="Gizlilik Politikası"
              onPress={() => navigate("/legal/privacy")}
            />
            <MenuItem
              label="Kullanım Koşulları"
              onPress={() => navigate("/legal/terms")}
            />
            <MenuItem
              label="İçerik ve Moderasyon"
              onPress={() => navigate("/legal/moderation")}
            />
            <MenuItem label="Çıkış Yap" onPress={() => { closeMenu(); signOut(); }} destructive />
            <MenuItem
              label="Hesabı Sil"
              onPress={confirmDeleteAccount}
              destructive
              bordered={false}
            />
          </View>
        </Pressable>
      </Modal>

      {deleting ? (
        <Modal visible transparent animationType="fade">
          <View className="flex-1 items-center justify-center bg-black/40">
            <View className="rounded-2xl bg-white px-8 py-6">
              <ActivityIndicator size="large" color="#374151" />
              <Text className="mt-4 text-base text-gray-700">Hesap siliniyor…</Text>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}
