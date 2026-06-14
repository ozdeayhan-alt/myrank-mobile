import { useEffect, useState } from "react";
import { Image } from "react-native";
import { resolveMediaDisplayUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { normalizeAspectRatio } from "../utils/mediaAspectRatio";

const aspectRatioCache = new Map<string, number>();

function cachedAspectRatio(mediaURL: string | undefined): number | null {
  if (!mediaURL?.trim()) return null;
  return aspectRatioCache.get(mediaURL) ?? null;
}

export function useMediaAspectRatio(
  mediaURL: string | undefined,
  contentType: "image" | "video" | "tweet" | undefined
): number {
  const displayURL = resolveMediaDisplayUrl(mediaURL);

  const [aspectRatio, setAspectRatio] = useState(() => {
    const cached = cachedAspectRatio(displayURL);
    if (cached != null) return cached;
    if (contentType === "video") return 16 / 9;
    return 1;
  });

  useEffect(() => {
    if (!displayURL || contentType === "tweet") {
      setAspectRatio(1);
      return;
    }

    const cached = cachedAspectRatio(displayURL);
    if (cached != null) {
      setAspectRatio(cached);
      return;
    }

    if (contentType === "image") {
      Image.getSize(
        displayURL,
        (width, height) => {
          const ratio = normalizeAspectRatio(width, height);
          aspectRatioCache.set(displayURL, ratio);
          setAspectRatio(ratio);
        },
        () => setAspectRatio(1)
      );
      return;
    }

    setAspectRatio(16 / 9);
  }, [displayURL, contentType]);

  return aspectRatio;
}
