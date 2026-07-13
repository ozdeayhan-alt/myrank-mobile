import type { FlowProvider } from "./types";

const PROVIDER_ID = "tiktok";

const TIKTOK_PATTERN = /tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i;

function extractVideoId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[^/]+\/video\/(\d+)/i,
    /tiktok\.com\/embed\/v2\/(\d+)/i,
    /tiktok\.com\/t\/([A-Za-z0-9]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function buildEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

export const tiktokProvider: FlowProvider = {
  id: PROVIDER_ID,
  canResolve(url) {
    return TIKTOK_PATTERN.test(url);
  },
  async resolve(url) {
    const providerVideoId = extractVideoId(url.trim());
    if (!providerVideoId) {
      return null;
    }

    return {
      provider: PROVIDER_ID,
      providerVideoId,
      providerUrl: url.trim(),
      thumbnailUrl: "",
    };
  },
  buildEmbedUrl(providerVideoId) {
    return buildEmbedUrl(providerVideoId);
  },
  buildPreviewEmbedUrl(providerVideoId) {
    return buildEmbedUrl(providerVideoId);
  },
};
