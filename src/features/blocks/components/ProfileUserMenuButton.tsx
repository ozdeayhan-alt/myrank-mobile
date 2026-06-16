import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  blockUser,
  fetchBlockStatus,
  unblockUser,
} from "../api/blockUser";
import { reportContent } from "../api/reportContent";
import { showReportReasonPicker } from "../utils/showReportReasonPicker";
import { showReportSubmittedAlert } from "../utils/reportFeedback";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

type ProfileUserMenuButtonProps = {
  userId: string;
  displayName: string;
};

export function ProfileUserMenuButton({
  userId,
  displayName,
}: ProfileUserMenuButtonProps) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const status = await fetchBlockStatus(userId);
        if (!cancelled) {
          setBlocked(status);
        }
      } catch {
        if (!cancelled) {
          setBlocked(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleReport = useCallback(() => {
    showReportReasonPicker((reason) => {
      void (async () => {
        try {
          await reportContent({ targetUserId: userId, reason });
          showReportSubmittedAlert();
        } catch (error) {
          Alert.alert("Hata", getUserFacingErrorMessage(error));
        }
      })();
    });
  }, [userId]);

  const toggleBlock = useCallback(async () => {
    setActing(true);
    try {
      if (blocked) {
        await unblockUser(userId);
        setBlocked(false);
        Alert.alert("Engel kaldırıldı", `${displayName} artık engelli değil.`);
      } else {
        await blockUser(userId);
        setBlocked(true);
        Alert.alert(
          "Engellendi",
          `${displayName} engellendi. Profiline ve gönderilerine erişemezsiniz.`,
          [{ text: "Tamam", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert("Hata", getUserFacingErrorMessage(error));
    } finally {
      setActing(false);
    }
  }, [blocked, displayName, router, userId]);

  const confirmBlock = useCallback(() => {
    if (blocked) {
      void toggleBlock();
      return;
    }

    Alert.alert(
      "Kullanıcıyı engelle",
      `${displayName} engellensin mi? Mesaj, takip ve gönderileri gizlenir.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Engelle",
          style: "destructive",
          onPress: () => void toggleBlock(),
        },
      ]
    );
  }, [blocked, displayName, toggleBlock]);

  const openMenu = useCallback(() => {
    Alert.alert(displayName, undefined, [
      { text: "Şikayet et", onPress: handleReport },
      {
        text: blocked ? "Engeli kaldır" : "Engelle",
        style: "destructive",
        onPress: confirmBlock,
      },
      { text: "İptal", style: "cancel" },
    ]);
  }, [blocked, confirmBlock, displayName, handleReport]);

  if (loading || acting) {
    return <ActivityIndicator size="small" color="#374151" />;
  }

  return (
    <Pressable
      onPress={openMenu}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Profil seçenekleri"
      className="pb-2 pl-2 pt-0"
    >
      <Ionicons name="ellipsis-horizontal" size={22} color="#374151" />
    </Pressable>
  );
}
