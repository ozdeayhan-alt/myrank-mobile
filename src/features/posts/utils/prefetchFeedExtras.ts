import { Image } from "expo-image";
import type { Post } from "@/features/posts/types";
import { resolvePostAuthorPhotoURL } from "@/features/posts/utils/resolvePostAuthor";
import type { StoryUserGroup } from "@/features/stories/lib/groupStoriesByUser";
import {
  listAvatarDisplayCandidateUrls,
  resolveFeedImageDisplayUrl,
  resolveMediaDisplayUrl,
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

export function prefetchStoryRingMedia(groups: StoryUserGroup[]): void {
  for (const group of groups.slice(0, 16)) {
    prefetchAvatarUrl(group.photoURL);

    const story = group.stories[0];
    if (!story) {
      continue;
    }

    const uri =
      story.posterURL?.trim()
        ? resolveMediaDisplayUrl(story.posterURL)
        : story.mediaType === "image"
          ? resolveFeedImageDisplayUrl(story.mediaURL)
          : resolveMediaDisplayUrl(story.posterURL ?? story.mediaURL);

    if (uri) {
      void Image.prefetch(uri);
    }
  }
}
