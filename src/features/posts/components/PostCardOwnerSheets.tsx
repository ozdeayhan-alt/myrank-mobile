import type { ReportReason } from "@/features/blocks/api/reportContent";
import { REPORT_PICKER_MESSAGE } from "@/features/blocks/utils/reportFeedback";
import { isRepostPost } from "../utils/repostUtils";
import type { Post } from "../types";
import { PostActionsSheet } from "./PostActionsSheet";

const REPORT_OPTIONS: { reason: ReportReason; label: string }[] = [
  { reason: "spam", label: "Spam" },
  { reason: "harassment", label: "Taciz" },
  { reason: "inappropriate", label: "Uygunsuz içerik" },
  { reason: "other", label: "Diğer" },
];

type PostCardOwnerSheetsProps = {
  post: Post;
  ownerMenuOpen: boolean;
  moreMenuOpen: boolean;
  deleteConfirmOpen: boolean;
  reportMenuOpen: boolean;
  ownerActionLoading: boolean;
  onCloseOwnerMenu: () => void;
  onCloseMoreMenu: () => void;
  onCloseDeleteConfirm: () => void;
  onCloseReportMenu: () => void;
  onEdit: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onOpenReportMenu: () => void;
  onReportReason: (reason: ReportReason) => void;
};

export function PostCardOwnerSheets({
  post,
  ownerMenuOpen,
  moreMenuOpen,
  deleteConfirmOpen,
  reportMenuOpen,
  ownerActionLoading,
  onCloseOwnerMenu,
  onCloseMoreMenu,
  onCloseDeleteConfirm,
  onCloseReportMenu,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onOpenReportMenu,
  onReportReason,
}: PostCardOwnerSheetsProps) {
  const isRepost = isRepostPost(post);

  const ownerActions = isRepost
    ? [
        {
          label: "Sil",
          destructive: true,
          disabled: ownerActionLoading,
          onPress: onRequestDelete,
        },
      ]
    : [
        {
          label: "Metni düzenle",
          disabled: ownerActionLoading,
          onPress: onEdit,
        },
        {
          label: "Sil",
          destructive: true,
          disabled: ownerActionLoading,
          onPress: onRequestDelete,
        },
      ];

  return (
    <>
      <PostActionsSheet
        visible={ownerMenuOpen}
        actions={ownerActions}
        onClose={onCloseOwnerMenu}
      />

      <PostActionsSheet
        visible={moreMenuOpen}
        actions={[
          {
            label: "Şikayet et",
            onPress: onOpenReportMenu,
          },
        ]}
        onClose={onCloseMoreMenu}
      />

      <PostActionsSheet
        visible={reportMenuOpen}
        headerTitle="Şikayet et"
        headerMessage={REPORT_PICKER_MESSAGE}
        cancelLabel="Vazgeç"
        actions={REPORT_OPTIONS.map((option) => ({
          label: option.label,
          onPress: () => onReportReason(option.reason),
        }))}
        onClose={onCloseReportMenu}
      />

      <PostActionsSheet
        visible={deleteConfirmOpen}
        headerTitle="Gönderiyi sil?"
        headerMessage="Bu işlem geri alınamaz. Gönderi ve medyası kalıcı olarak silinir."
        cancelLabel="Vazgeç"
        actions={[
          {
            label: "Sil",
            destructive: true,
            disabled: ownerActionLoading,
            onPress: onConfirmDelete,
          },
        ]}
        onClose={onCloseDeleteConfirm}
      />
    </>
  );
}
