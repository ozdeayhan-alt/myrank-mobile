import { PostCommentsSheet } from "./PostCommentsSheet";
import { useCommentSheetStore } from "../store/useCommentSheetStore";

export function CommentSheetHost() {
  const postId = useCommentSheetStore((state) => state.postId);
  const onSuccess = useCommentSheetStore((state) => state.onSuccess);
  const close = useCommentSheetStore((state) => state.close);

  return (
    <PostCommentsSheet
      visible={Boolean(postId)}
      postId={postId ?? ""}
      onClose={close}
      onCommentSuccess={onSuccess ?? undefined}
    />
  );
}
