import type { FlowEmbedOptions, FlowProvider } from "./types";

const PROVIDER_ID = "youtube";

const VIDEO_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([\w-]{11})/i,
  /youtu\.be\/([\w-]{11})/i,
  /youtube\.com\/shorts\/([\w-]{11})/i,
  /youtube\.com\/embed\/([\w-]{11})/i,
  /m\.youtube\.com\/watch\?v=([\w-]{11})/i,
];

function extractVideoId(url: string): string | null {
  const trimmed = url.trim();
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

function buildCanonicalUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function buildThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function buildEmbedUrl(videoId: string, options: FlowEmbedOptions = {}): string {
  const params = new URLSearchParams({
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });

  if (options.autoplay) {
    params.set("autoplay", "1");
  }
  if (options.muted) {
    params.set("mute", "1");
  }
  if (options.controls === false) {
    params.set("controls", "0");
  }
  if (typeof options.startSeconds === "number") {
    params.set("start", String(options.startSeconds));
  }
  if (typeof options.endSeconds === "number") {
    params.set("end", String(options.endSeconds));
  }
  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export const youtubeProvider: FlowProvider = {
  id: PROVIDER_ID,
  canResolve(url) {
    return extractVideoId(url) !== null;
  },
  async resolve(url) {
    const providerVideoId = extractVideoId(url);
    if (!providerVideoId) {
      return null;
    }

    return {
      provider: PROVIDER_ID,
      providerVideoId,
      providerUrl: buildCanonicalUrl(providerVideoId),
      thumbnailUrl: buildThumbnailUrl(providerVideoId),
    };
  },
  buildEmbedUrl(providerVideoId, options) {
    return buildEmbedUrl(providerVideoId, options);
  },
  buildPreviewEmbedUrl(providerVideoId) {
    return buildEmbedUrl(providerVideoId, {
      autoplay: true,
      muted: true,
      controls: false,
      startSeconds: 0,
      endSeconds: 3,
      loop: true,
    });
  },
};
