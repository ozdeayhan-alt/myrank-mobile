import { useEffect, useState } from "react";
import { Image } from "react-native";
import { normalizeAspectRatio } from "@/features/posts/utils/mediaAspectRatio";

export function useUriAspectRatio(
  uri: string | null | undefined,
  fallback = 1
): number {
  const [aspectRatio, setAspectRatio] = useState(fallback);

  useEffect(() => {
    if (!uri?.trim()) {
      setAspectRatio(fallback);
      return;
    }

    Image.getSize(
      uri,
      (width, height) => {
        setAspectRatio(normalizeAspectRatio(width, height));
      },
      () => setAspectRatio(fallback)
    );
  }, [fallback, uri]);

  return aspectRatio;
}
