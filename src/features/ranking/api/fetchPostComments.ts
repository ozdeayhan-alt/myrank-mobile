import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { PostComment } from "../types";
import { enrichCommentAuthors } from "./enrichCommentAuthors";

function mapCommentDoc(id: string, data: DocumentData): PostComment {
  return {
    id,
    actorId: data.actorId ?? "",
    commentText: data.commentText ?? "",
    createdAt:
      data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    actorDisplayName: data.actorDisplayName
      ? String(data.actorDisplayName)
      : undefined,
    actorPhotoURL: data.actorPhotoURL ? String(data.actorPhotoURL) : undefined,
  };
}

export async function fetchPostComments(postId: string): Promise<PostComment[]> {
  const q = query(
    collection(getFirestoreDb(), "interactions"),
    where("postId", "==", postId),
    where("type", "==", "comment"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map((doc) => mapCommentDoc(doc.id, doc.data()));
  return enrichCommentAuthors(comments);
}
