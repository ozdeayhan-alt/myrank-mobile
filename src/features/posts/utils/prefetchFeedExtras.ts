import { Image } from "expo-image";
import type { Post } from "@/features/posts/types";
import { resolvePostAuthorPhotoURL } from "@/features/posts/utils/resolvePostAuthor";
import {
  listAvatarDisplayCandidateUrls,
} from "@/lib/media/resolveMediaDisplayUrl";

export function prefetchAvatarUrl(url: string | undefined | null): void {
  const candidate = listAvatarDisplayCandidateUrls(url)[0];
  if (candidate) {
    void Image.prefetch(candidate);
  }
}

export function prefetchPostAuthorAvatar(post: Post): void {
  prefetchAvatarUrl(resolvePostAuthorPhotoURL(post));
}
