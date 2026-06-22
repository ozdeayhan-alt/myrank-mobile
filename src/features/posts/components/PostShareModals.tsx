import type { Post } from "../types";
import { canSharePostToStory } from "../utils/postStoryShare";
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
  onStorySelect: () => void;
  onExternalShare: () => void;
  onReposted?: () => void;
  onOpenVideo?: (postId: string) => void;
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
  onStorySelect,
  onExternalShare,
  onReposted,
  onOpenVideo,
}: PostShareModalsProps) {
  return (
    <>
      <SharePostSheet
        visible={shareSheetOpen}
        canRepost={canRepost}
        canShareToStory={canSharePostToStory(post)}
        loading={shareLoading}
        onClose={onCloseShareSheet}
        onRepost={onRepostSelect}
        onStory={onStorySelect}
        onExternalShare={onExternalShare}
      />

      {!isRepostPost(post) ? (
        <RepostQuoteModal
          visible={repostOpen}
          post={post}
          onClose={onCloseRepost}
          onReposted={onReposted}
          onOpenVideo={onOpenVideo}
        />
      ) : null}
    </>
  );
}
