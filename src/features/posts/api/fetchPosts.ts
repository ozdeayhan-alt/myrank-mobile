import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import type { UserMetadata } from "@/features/profile/types";
import { getFirestoreDb } from "@/lib/firebase";
import type { Post } from "../types";
import { mapPostDoc } from "./mapPost";
import {
  hasActiveSegmentFilters,
  postMatchesSegmentFilters,
} from "./matchesSegmentFilters";

const PARTIAL_FILTER_FETCH_CAP = 80;

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

export async function fetchPostsByScore(max = 20): Promise<Post[]> {
  const q = query(
    collection(getFirestoreDb(), "posts"),
    orderBy("postScore", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => mapPostDoc(doc.id, doc.data()));
}

/**
 * Global First: null veya boş filtre → tüm gönderiler (postScore).
 * En az bir filtre → metadata alanlarına dinamik where (index yoksa client filtre fallback).
 */
export async function fetchPostsBySegment(
  filters: UserMetadata | null,
  max = 30
): Promise<Post[]> {
  if (!filters || !hasActiveSegmentFilters(filters)) {
    return fetchPostsByScore(max);
  }

  const whereConstraints = buildMetadataWhereConstraints(filters);

  try {
    const q = query(
      collection(getFirestoreDb(), "posts"),
      ...whereConstraints,
      orderBy("postScore", "desc"),
      limit(max)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => mapPostDoc(doc.id, doc.data()));
  } catch (error) {
    if (!isMissingIndexError(error)) {
      throw error;
    }

    const snapshot = await getDocs(
      query(
        collection(getFirestoreDb(), "posts"),
        orderBy("postScore", "desc"),
        limit(PARTIAL_FILTER_FETCH_CAP)
      )
    );

    return snapshot.docs
      .map((doc) => mapPostDoc(doc.id, doc.data()))
      .filter((post) => postMatchesSegmentFilters(post.metadata, filters))
      .slice(0, max);
  }
}

export async function fetchPostsByCreatedAt(max = 20): Promise<Post[]> {
  const q = query(
    collection(getFirestoreDb(), "posts"),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => mapPostDoc(doc.id, doc.data()));
}
