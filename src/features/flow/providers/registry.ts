import type { FlowEmbedOptions, FlowProvider, FlowResolvedVideo } from "./types";
import { youtubeProvider } from "./youtube";
import { tiktokProvider } from "./tiktok";

const providers: FlowProvider[] = [youtubeProvider, tiktokProvider];

export function findProviderForUrl(url: string): FlowProvider | null {
  for (const provider of providers) {
    if (provider.canResolve(url)) {
      return provider;
    }
  }
  return null;
}

export function getProviderById(providerId: string | undefined | null): FlowProvider | null {
  if (!providerId) {
    return null;
  }

  return providers.find((entry) => entry.id === providerId) ?? null;
}

export async function resolveFlowUrl(url: string): Promise<FlowResolvedVideo | null> {
  const provider = findProviderForUrl(url);
  if (!provider) {
    return null;
  }

  return provider.resolve(url);
}

export function buildEmbedUrlForPost(
  post: { provider?: string; providerVideoId?: string },
  options?: FlowEmbedOptions
): string | null {
  const provider = getProviderById(post.provider);
  if (!provider || !post.providerVideoId) {
    return null;
  }

  return provider.buildEmbedUrl(post.providerVideoId, options);
}

export function buildPreviewEmbedUrlForPost(
  post: { provider?: string; providerVideoId?: string }
): string | null {
  const provider = getProviderById(post.provider);
  if (!provider || !post.providerVideoId) {
    return null;
  }

  return provider.buildPreviewEmbedUrl(post.providerVideoId);
}
