import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PostActionsSheet } from "@/features/posts/components/PostActionsSheet";
import { REPORT_PICKER_MESSAGE } from "../utils/reportFeedback";
import {
  blockUser,
  fetchBlockStatus,
  unblockUser,
} from "../api/blockUser";
import type { ReportReason } from "../api/reportContent";
import { reportContent } from "../api/reportContent";
import { showReportSubmittedAlert } from "../utils/reportFeedback";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

const REPORT_OPTIONS: { reason: ReportReason; label: string }[] = [
  { reason: "spam", label: "Spam" },
  { reason: "harassment", label: "Taciz" },
  { reason: "inappropriate", label: "Uygunsuz içerik" },
  { reason: "other", label: "Diğer" },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

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

  const handleReportReason = useCallback(
    (reason: ReportReason) => {
      void (async () => {
        try {
          await reportContent({ targetUserId: userId, reason });
          showReportSubmittedAlert();
        } catch (error) {
          Alert.alert("Hata", getUserFacingErrorMessage(error));
        }
      })();
    },
    [userId]
  );

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

  const handleBlockFromMenu = useCallback(() => {
    if (blocked) {
      void toggleBlock();
      return;
    }
    setBlockConfirmOpen(true);
  }, [blocked, toggleBlock]);

  if (loading || acting) {
    return <ActivityIndicator size="small" color="#374151" />;
  }

  return (
    <>
      <Pressable
        onPress={() => setMenuOpen(true)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Profil seçenekleri"
        className="px-1 pb-2 pt-0"
      >
        <Ionicons name="ellipsis-horizontal" size={22} color="#374151" />
      </Pressable>

      <PostActionsSheet
        visible={menuOpen}
        actions={[
          {
            label: "Şikayet et",
            onPress: () => setReportOpen(true),
          },
          {
            label: blocked ? "Engeli kaldır" : "Engelle",
            destructive: true,
            onPress: handleBlockFromMenu,
          },
        ]}
        onClose={() => setMenuOpen(false)}
      />

      <PostActionsSheet
        visible={reportOpen}
        headerTitle="Şikayet et"
        headerMessage={REPORT_PICKER_MESSAGE}
        cancelLabel="Vazgeç"
        actions={REPORT_OPTIONS.map((option) => ({
          label: option.label,
          onPress: () => handleReportReason(option.reason),
        }))}
        onClose={() => setReportOpen(false)}
      />

      <PostActionsSheet
        visible={blockConfirmOpen}
        headerTitle="Kullanıcıyı engelle?"
        headerMessage={`${displayName} engellensin mi? Mesaj, takip ve gönderileri gizlenir.`}
        cancelLabel="Vazgeç"
        actions={[
          {
            label: "Engelle",
            destructive: true,
            disabled: acting,
            onPress: () => void toggleBlock(),
          },
        ]}
        onClose={() => setBlockConfirmOpen(false)}
      />
    </>
  );
}
