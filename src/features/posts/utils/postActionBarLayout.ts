const COMPACT_VOTE_BREAKPOINT = 400;
const FEED_VOTE_DIAMETER = 44;
const FEED_VOTE_DIAMETER_COMPACT = 36;
const FEED_VOTE_DIAMETER_TIGHT = 32;

const FEED_ACTION_LABEL_MAX = 80;
const FEED_ACTION_LABEL_COMPACT = 64;
const FEED_ACTION_LABEL_TIGHT = 52;

const FEED_ACTION_HORIZONTAL_PADDING = 16;
const FEED_MENU_SLOT_WIDTH = 40;
const FEED_VOTE_GAP = 6;
const FEED_SHARE_VOTE_GAP = 4;
const FEED_ACTION_MIN_WIDTH = 40;
/** Sağda yorum + kaydet (paylaş oyun solunda). */
const FEED_RIGHT_ACTION_COUNT = 2;
const FEED_ACTION_GAP_TOTAL = 4;
const FEED_ACTION_RIGHT_PAD = 4;
const FEED_ROW_SAFETY = 4;

export type PostActionBarLayout = {
  /** Yalnızca çok dar ekranda oylar alt satıra alınır. */
  stacked: boolean;
  voteDiameter: number;
  /** Paylaş / yorum / kaydet sayaç metni için üst genişlik sınırı. */
  actionLabelMaxWidth: number;
  voteBlockWidth: number;
  /** Paylaş: ekran ortasından translateX (Alçalt'ın solu). */
  shareCenterOffsetX: number;
  /** Oy çifti: ekran ortasından translateX. */
  voteCenterOffsetX: number;
  /** Sağ blok: Yükselt'ten sonra boşluk. */
  rightActionsInset: number;
};

/** flex-1 | paylaş+oy | flex-1 tek satırı için minimum genişlik. */
export function estimatePostActionBarSingleRowMinWidth(
  voteDiameter: number
): number {
  const voteBlock = voteDiameter * 2 + FEED_VOTE_GAP;
  const shareBlock = FEED_ACTION_MIN_WIDTH + FEED_SHARE_VOTE_GAP;
  const actionsMin =
    FEED_RIGHT_ACTION_COUNT * FEED_ACTION_MIN_WIDTH +
    FEED_ACTION_GAP_TOTAL +
    FEED_ACTION_RIGHT_PAD;

  return (
    FEED_ACTION_HORIZONTAL_PADDING +
    FEED_MENU_SLOT_WIDTH +
    shareBlock +
    voteBlock +
    actionsMin +
    FEED_ROW_SAFETY
  );
}

function fitsSingleRow(screenWidth: number, voteDiameter: number): boolean {
  return estimatePostActionBarSingleRowMinWidth(voteDiameter) <= screenWidth;
}

function buildLayout(
  screenWidth: number,
  voteDiameter: number,
  actionLabelMaxWidth: number
): PostActionBarLayout {
  const voteBlockWidth = voteDiameter * 2 + FEED_VOTE_GAP;
  const shareSlotWidth = actionLabelMaxWidth;
  const voteCenterOffsetX = -voteBlockWidth / 2;
  const shareCenterOffsetX =
    voteCenterOffsetX - FEED_SHARE_VOTE_GAP - shareSlotWidth;
  const rightActionsInset = Math.ceil(voteBlockWidth / 2) + 8;

  return {
    stacked: !fitsSingleRow(screenWidth, voteDiameter),
    voteDiameter,
    actionLabelMaxWidth,
    voteBlockWidth,
    shareCenterOffsetX,
    voteCenterOffsetX,
    rightActionsInset,
  };
}

export function getPostActionBarLayout(
  screenWidth: number
): PostActionBarLayout {
  const compact = screenWidth < COMPACT_VOTE_BREAKPOINT;
  let voteDiameter = compact ? FEED_VOTE_DIAMETER_COMPACT : FEED_VOTE_DIAMETER;
  let actionLabelMaxWidth = compact
    ? FEED_ACTION_LABEL_COMPACT
    : FEED_ACTION_LABEL_MAX;

  if (screenWidth < 340) {
    actionLabelMaxWidth = FEED_ACTION_LABEL_TIGHT;
  }

  if (!fitsSingleRow(screenWidth, voteDiameter)) {
    voteDiameter = FEED_VOTE_DIAMETER_TIGHT;
    actionLabelMaxWidth = FEED_ACTION_LABEL_TIGHT;
  }

  return buildLayout(screenWidth, voteDiameter, actionLabelMaxWidth);
}
