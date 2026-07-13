export type FlowProviderId = string;

export type FlowResolvedVideo = {
  provider: FlowProviderId;
  providerVideoId: string;
  providerUrl: string;
  thumbnailUrl: string;
  title?: string;
  duration?: number | null;
};

export type FlowEmbedOptions = {
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  startSeconds?: number;
  endSeconds?: number;
  loop?: boolean;
};

export type FlowProvider = {
  id: FlowProviderId;
  canResolve: (url: string) => boolean;
  resolve: (url: string) => Promise<FlowResolvedVideo | null>;
  buildEmbedUrl: (providerVideoId: string, options?: FlowEmbedOptions) => string;
  buildPreviewEmbedUrl: (providerVideoId: string) => string;
};
