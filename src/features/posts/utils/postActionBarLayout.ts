const STACKED_BREAKPOINT = 380;
const COMPACT_VOTE_BREAKPOINT = 400;
const FEED_VOTE_DIAMETER = 44;
const FEED_VOTE_DIAMETER_COMPACT = 36;

export type PostActionBarLayout = {
  /** Dar ekranda oylar alt satıra alınır (çakışmayı önler). */
  stacked: boolean;
  voteDiameter: number;
  /** Paylaş / kaydet sayaç metni için üst genişlik sınırı. */
  actionLabelMaxWidth: number;
};

export function getPostActionBarLayout(screenWidth: number): PostActionBarLayout {
  const compact = screenWidth < COMPACT_VOTE_BREAKPOINT;

  return {
    stacked: screenWidth < STACKED_BREAKPOINT,
    voteDiameter: compact ? FEED_VOTE_DIAMETER_COMPACT : FEED_VOTE_DIAMETER,
    actionLabelMaxWidth: compact ? 64 : 80,
  };
}
