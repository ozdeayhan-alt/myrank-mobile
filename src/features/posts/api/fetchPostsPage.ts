import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import {
  buildSegmentKey,
  type UserMetadata,
} from "@/features/profile/types";
import { getFirestoreDb } from "@/lib/firebase";
import type { Post } from "../types";
import { FEED_PAGE_SIZE } from "../constants";
import { mapPostDoc } from "./mapPost";
import {
  hasActiveSegmentFilters,
  postMatchesSegmentFilters,
  shouldQueryBySegmentKey,
} from "./matchesSegmentFilters";

const PARTIAL_FILTER_FETCH_CAP = 80;

export type PostsPageResult = {
  posts: Post[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
};

function buildMetadataWhereConstraints(
  filters: UserMetadata
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (filters.country.trim()) {
    constraints.push(where("metadata.country", "==", filters.country.trim()));
  }
  if (filters.city.trim()) {
    constraints.push(where("metadata.city", "==", filters.city.trim()));
  }
  if (filters.gender.trim()) {
    constraints.push(where("metadata.gender", "==", filters.gender.trim()));
  }
  if (filters.age !== null && filters.age > 0) {
    constraints.push(where("metadata.age", "==", filters.age));
  }
  if (filters.profession.trim()) {
    constraints.push(
      where("metadata.profession", "==", filters.profession.trim())
    );
  }
  if (filters.maritalStatus.trim()) {
    constraints.push(
      where("metadata.maritalStatus", "==", filters.maritalStatus.trim())
    );
  }

  return constraints;
}

function isMissingIndexError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = String((error as { message?: string }).message ?? "");
  const code = String((error as { code?: string }).code ?? "");
  return (
    code === "failed-precondition" ||
    message.includes("requires an index") ||
    message.includes("indexes?create_composite")
  );
}

function mapSnapshotToPage(
  snap: Awaited<ReturnType<typeof getDocs>>,
  pageSize: number
): PostsPageResult {
  const posts = snap.docs.map((doc) =>
    mapPostDoc(doc.id, doc.data() as DocumentData)
  );
  const lastDoc = (snap.docs[snap.docs.length - 1] ??
    null) as DocumentSnapshot | null;
  return {
    posts,
    lastDoc,
    hasMore: snap.docs.length === pageSize,
  };
}

export async function fetchPostsByCreatedAtPage(
  cursor: DocumentSnapshot | null = null,
  pageSize = FEED_PAGE_SIZE
): Promise<PostsPageResult> {
  const constraints: QueryConstraint[] = [
    orderBy("createdAt", "desc"),
    limit(pageSize),
  ];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const snap = await getDocs(
    query(collection(getFirestoreDb(), "posts"), ...constraints)
  );
  return mapSnapshotToPage(snap, pageSize);
}

export async function fetchPostsByScorePage(
  cursor: DocumentSnapshot | null = null,
  pageSize = FEED_PAGE_SIZE
): Promise<PostsPageResult> {
  const constraints: QueryConstraint[] = [
    orderBy("postScore", "desc"),
    limit(pageSize),
  ];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const snap = await getDocs(
    query(collection(getFirestoreDb(), "posts"), ...constraints)
  );
  return mapSnapshotToPage(snap, pageSize);
}

/**
 * Segment feed with cursor pagination (postScore desc).
 */
export async function fetchPostsBySegmentPage(
  filters: UserMetadata | null,
  cursor: DocumentSnapshot | null = null,
  pageSize = FEED_PAGE_SIZE
): Promise<PostsPageResult> {
  if (!filters || !hasActiveSegmentFilters(filters)) {
    return fetchPostsByScorePage(cursor, pageSize);
  }

  if (shouldQueryBySegmentKey(filters)) {
    const segmentKey = buildSegmentKey(filters);
    const constraints: QueryConstraint[] = [
      where("segmentKey", "==", segmentKey),
      orderBy("postScore", "desc"),
      limit(pageSize),
    ];
    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    const snap = await getDocs(
      query(collection(getFirestoreDb(), "posts"), ...constraints)
    );
    return mapSnapshotToPage(snap, pageSize);
  }

  const whereConstraints = buildMetadataWhereConstraints(filters);

  try {
    const constraints: QueryConstraint[] = [
      ...whereConstraints,
      orderBy("postScore", "desc"),
      limit(pageSize),
    ];
    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    const snap = await getDocs(
      query(collection(getFirestoreDb(), "posts"), ...constraints)
    );
    return mapSnapshotToPage(snap, pageSize);
  } catch (error) {
    if (!isMissingIndexError(error)) {
      throw error;
    }

    // Fallback: no cursor support without index — first page only
    if (cursor) {
      return { posts: [], lastDoc: null, hasMore: false };
    }

    const snap = await getDocs(
      query(
        collection(getFirestoreDb(), "posts"),
        orderBy("postScore", "desc"),
        limit(PARTIAL_FILTER_FETCH_CAP)
      )
    );

    const posts = snap.docs
      .map((doc) => mapPostDoc(doc.id, doc.data()))
      .filter((post) => postMatchesSegmentFilters(post.metadata, filters))
      .slice(0, pageSize);

    return {
      posts,
      lastDoc: null,
      hasMore: false,
    };
  }
}
