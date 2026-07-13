import type { Post } from "../types";
import { isRepostPost } from "../utils/repostUtils";
import { RepostQuoteModal } from "./RepostQuoteModal";
import { SharePostSheet } from "./SharePostSheet";

type PostShareModalsProps = {
  post: Post;
  shareSheetOpen: boolean;
  onCloseShareSheet: () => void;
  repostOpen: boolean;
  onCloseRepost: () => void;
  canRepost: boolean;
  shareLoading: boolean;
  onRepostSelect: () => void;
  onExternalShare: () => void;
  onReposted?: () => void;
};

export function PostShareModals({
  post,
  shareSheetOpen,
  onCloseShareSheet,
  repostOpen,
  onCloseRepost,
  canRepost,
  shareLoading,
  onRepostSelect,
  onExternalShare,
  onReposted,
}: PostShareModalsProps) {
  return (
    <>
      <SharePostSheet
        visible={shareSheetOpen}
        canRepost={canRepost}
        loading={shareLoading}
        onClose={onCloseShareSheet}
        onRepost={onRepostSelect}
        onExternalShare={onExternalShare}
      />

      {!isRepostPost(post) ? (
        <RepostQuoteModal
          visible={repostOpen}
          post={post}
          onClose={onCloseRepost}
          onReposted={onReposted}
        />
      ) : null}
    </>
  );
}
