import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import {
  buildSegmentKey,
  EMPTY_METADATA,
  resolveDisplayName,
  resolvePhotoURL,
} from "@/features/profile/types";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import type { CreatePostInput } from "../types";
import {
  extractHashtags,
  extractMentionTokens,
} from "../utils/parsePostContent";
import { metadataOrEmpty, parsePostMetadata } from "./parsePostMetadata";
import { resolveMentions } from "./resolveMentions";

export type CreatePostResult = {
  id: string;
  mentionUserIds: string[];
};

export async function createPost(
  authorId: string,
  input: CreatePostInput
): Promise<CreatePostResult> {
  const userSnap = await getDoc(doc(getFirestoreDb(), "users", authorId));
  const userData = userSnap.exists() ? userSnap.data() : null;
  const metadata = userData?.metadata
    ? metadataOrEmpty(parsePostMetadata({ metadata: userData.metadata }))
    : { ...EMPTY_METADATA };
  const segmentKey = buildSegmentKey(metadata);

  const authUser = getFirebaseAuth().currentUser;
  const authorDisplayName = resolveDisplayName(
    userData?.displayName as string | undefined,
    authUser?.displayName
  );
  const authorPhotoURL = resolvePhotoURL(
    userData?.photoURL as string | undefined,
    authUser?.photoURL
  );

  const trimmedContent = input.content.trim();
  const hashtags = extractHashtags(trimmedContent);
  const mentionTokens = extractMentionTokens(trimmedContent);
  let mentionUserIds: string[] = [];

  if (mentionTokens.length > 0) {
    try {
      const resolved = await resolveMentions(mentionTokens);
      mentionUserIds = [
        ...new Set(resolved.map((entry) => entry.userId).filter(Boolean)),
      ];
    } catch {
      // Mention resolution is best-effort; post still publishes.
    }
  }

  const docRef = await addDoc(collection(getFirestoreDb(), "posts"), {
    authorId,
    authorDisplayName,
    ...(authorPhotoURL ? { authorPhotoURL } : {}),
    metadata,
    segmentKey,
    postScore: 0,
    likeCount: 0,
    dislikeCount: 0,
    shareCount: 0,
    saveCount: 0,
    commentCount: 0,
    contentType: input.contentType,
    content: trimmedContent,
    ...(hashtags.length > 0 ? { hashtags } : {}),
    ...(mentionUserIds.length > 0 ? { mentionUserIds } : {}),
    ...(input.mediaURL ? { mediaURL: input.mediaURL } : {}),
    ...(input.hlsURL ? { hlsURL: input.hlsURL } : {}),
    ...(input.posterURL ? { posterURL: input.posterURL } : {}),
    ...(typeof input.mediaWidth === "number" ? { mediaWidth: input.mediaWidth } : {}),
    ...(typeof input.mediaHeight === "number"
      ? { mediaHeight: input.mediaHeight }
      : {}),
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, mentionUserIds };
}
