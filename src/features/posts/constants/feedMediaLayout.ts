/** Ana akış listesinin yatay padding'i. */
export const DEFAULT_LIST_HORIZONTAL_INSET = 8;

export type PostFeedMediaLayoutOptions = {
  listHorizontalInset?: number;
  /** true: medya liste padding'ini aşarak kenardan kenara (ana akış). */
  mediaEdgeBleed?: boolean;
};

export const DEFAULT_FEED_MEDIA_LAYOUT: Required<PostFeedMediaLayoutOptions> = {
  listHorizontalInset: DEFAULT_LIST_HORIZONTAL_INSET,
  mediaEdgeBleed: true,
};
