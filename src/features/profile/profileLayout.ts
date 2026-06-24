/** Profil üst bölümü (avatar, skor, açılır kartlar) yatay iç boşluk */
export const PROFILE_HORIZONTAL_PADDING = 24;

/** Kenar butonları (mesaj, takip) ekran kenarından hafif içeride */
export const PROFILE_EDGE_INSET = 12;

/** Sağ üst menü ikonu ekran kenarından içeride */
export const PROFILE_MENU_RIGHT_INSET = 16;

/** Segment sırası üçgeni, Toplam Puan kartından iki tık (16px) dar — @deprecated üçgen kaldırıldı */
export const PROFILE_SEGMENT_BADGE_INSET = 16;

export function getProfileScoreCardWidth(screenWidth: number): number {
  return screenWidth - PROFILE_HORIZONTAL_PADDING * 2;
}

const GAUGE_WIDTH_RATIO = 0.7;
const GAUGE_WIDTH_MIN = 168;
const GAUGE_WIDTH_MAX = 240;
const GAUGE_HEIGHT_RATIO = 0.6;
const GAUGE_RADIUS_RATIO = 0.4;
const GAUGE_STROKE_RATIO = 0.079;
const FONT_SCALE_CLAMP_MAX = 1.25;

export type ProfileSegmentGaugeLayout = {
  containerWidth: number;
  gaugeWidth: number;
  gaugeHeight: number;
  cx: number;
  cy: number;
  radius: number;
  stroke: number;
  trackStroke: number;
  arcLength: number;
  scoreTop: number;
  metaAreaHeight: number;
  dotsTop: number;
  metaTop: number;
  rankFontSize: number;
  rankLineHeight: number;
  tpFontSize: number;
  tpLineHeight: number;
  labelFontSize: number;
  metaLabelFontSize: number;
  metaValueFontSize: number;
  rankBottomInset: number;
  segmentLabelGap: number;
  stackedMeta: boolean;
  infoIconSize: number;
  gaugeInfoIconSize: number;
};

export function getProfileSegmentGaugeLayout(
  screenWidth: number,
  fontScale = 1
): ProfileSegmentGaugeLayout {
  const contentWidth = getProfileScoreCardWidth(screenWidth);
  const scale = Math.min(Math.max(fontScale, 1), FONT_SCALE_CLAMP_MAX);
  const effectiveContentWidth = contentWidth / scale;

  const gaugeWidth = Math.round(
    Math.min(
      GAUGE_WIDTH_MAX,
      Math.max(GAUGE_WIDTH_MIN, effectiveContentWidth * GAUGE_WIDTH_RATIO)
    )
  );
  const gaugeHeight = Math.round(gaugeWidth * GAUGE_HEIGHT_RATIO);
  const cx = gaugeWidth / 2;
  const cy = gaugeHeight - 8;
  const radius = Math.round(gaugeWidth * GAUGE_RADIUS_RATIO);
  const stroke = Math.max(10, Math.round(gaugeWidth * GAUGE_STROKE_RATIO));
  const trackStroke = stroke + 2;
  const arcLength = Math.PI * radius;
  const metaAreaHeight = Math.round(gaugeHeight * 0.28);
  const scoreTop = Math.round(gaugeHeight * 0.36);
  const dotsTop = gaugeHeight - 10;
  const metaTop = gaugeHeight + 4;
  const rankBottomInset = gaugeHeight - cy + 4;
  const segmentLabelGap = 4;
  const stackedMeta = gaugeWidth < 176 || contentWidth < 300;

  const rankFontSize = Math.round(
    Math.min(36, Math.max(26, gaugeWidth * 0.16)) * Math.min(scale, 1.15)
  );

  return {
    containerWidth: contentWidth,
    gaugeWidth,
    gaugeHeight,
    cx,
    cy,
    radius,
    stroke,
    trackStroke,
    arcLength,
    scoreTop,
    metaAreaHeight,
    dotsTop,
    metaTop,
    rankFontSize,
    rankLineHeight: Math.round(rankFontSize * 1.1),
    tpFontSize: Math.round(Math.min(28, Math.max(20, gaugeWidth * 0.13))),
    tpLineHeight: Math.round(Math.min(32, Math.max(24, gaugeWidth * 0.15))),
    labelFontSize: Math.max(9, Math.round(gaugeWidth * 0.05)),
    metaLabelFontSize: Math.max(7, Math.round(gaugeWidth * 0.045)),
    metaValueFontSize: Math.max(9, Math.round(gaugeWidth * 0.055)),
    rankBottomInset,
    segmentLabelGap,
    stackedMeta,
    infoIconSize: Math.max(11, Math.round(gaugeWidth * 0.06)),
    gaugeInfoIconSize: Math.max(13, Math.round(gaugeWidth * 0.065)),
  };
}

/** @deprecated Üçgen rozet kaldırıldı; gauge layout kullanın */
export function getProfileSegmentBadgeWidth(screenWidth: number): number {
  return getProfileScoreCardWidth(screenWidth) - PROFILE_SEGMENT_BADGE_INSET;
}

/** @deprecated Üçgen rozet kaldırıldı */
export function getProfileSegmentBadgeHeight(badgeWidth: number): number {
  return Math.round(badgeWidth * 0.42);
}

/** @deprecated Birleşik gauge rozeti ile artık kullanılmıyor */
export const PROFILE_SEGMENT_TO_SCORE_GAP = 8;

/** Alçalt/Yükselt optik ortalama düzeltmesi (sağa kaydırma) */
export const PROFILE_VOTE_CENTER_NUDGE = 6;

const PROFILE_VOTE_DIAMETER_MAX = 66;
const PROFILE_VOTE_DIAMETER_MIN = 52;
const PROFILE_SIDE_DIAMETER_MAX = 58;
const PROFILE_SIDE_DIAMETER_MIN = 46;
const PROFILE_VOTE_GAP = 10;
/** Gölge / hitSlop taşması için satır genişliği güvenlik payı */
const PROFILE_VOTE_ROW_SAFETY = 12;

export type ProfileVoteControlLayout = {
  voteDiameter: number;
  sideDiameter: number;
  voteGap: number;
  centerNudge: number;
  /** Dar ekranda oy üstte, takip/mesaj altta */
  stacked: boolean;
  rowMinHeight: number;
};

function profileVoteRowWidth(
  contentWidth: number,
  voteDiameter: number,
  sideDiameter: number,
  centerNudge: number
): number {
  return sideDiameter * 2 + voteDiameter * 2 + PROFILE_VOTE_GAP + centerNudge;
}

/**
 * Profil oy / takip / mesaj satırı — ekran genişliğine göre çap ve düzen.
 * Samsung A12 gibi dar cihazlarda butonların üst üste binmesini önler.
 */
export function getProfileVoteControlLayout(
  screenWidth: number
): ProfileVoteControlLayout {
  const contentWidth = getProfileScoreCardWidth(screenWidth);
  const availableWidth = contentWidth - PROFILE_VOTE_ROW_SAFETY;
  const centerNudge =
    contentWidth >= 340 ? PROFILE_VOTE_CENTER_NUDGE : 0;

  let voteDiameter = PROFILE_VOTE_DIAMETER_MAX;
  let sideDiameter = PROFILE_SIDE_DIAMETER_MAX;

  while (
    voteDiameter > PROFILE_VOTE_DIAMETER_MIN &&
    profileVoteRowWidth(contentWidth, voteDiameter, sideDiameter, centerNudge) >
      availableWidth
  ) {
    voteDiameter -= 2;
    sideDiameter = Math.max(
      PROFILE_SIDE_DIAMETER_MIN,
      Math.round(voteDiameter * (PROFILE_SIDE_DIAMETER_MAX / PROFILE_VOTE_DIAMETER_MAX))
    );
  }

  const singleRowFits =
    profileVoteRowWidth(contentWidth, voteDiameter, sideDiameter, centerNudge) <=
    availableWidth;

  if (singleRowFits) {
    return {
      voteDiameter,
      sideDiameter,
      voteGap: PROFILE_VOTE_GAP,
      centerNudge,
      stacked: false,
      rowMinHeight: voteDiameter + 6,
    };
  }

  voteDiameter = Math.max(
    PROFILE_VOTE_DIAMETER_MIN,
    Math.min(PROFILE_VOTE_DIAMETER_MAX, Math.floor(contentWidth * 0.24))
  );
  sideDiameter = Math.max(
    PROFILE_SIDE_DIAMETER_MIN,
    Math.min(
      PROFILE_SIDE_DIAMETER_MAX,
      Math.round(voteDiameter * (PROFILE_SIDE_DIAMETER_MAX / PROFILE_VOTE_DIAMETER_MAX))
    )
  );

  return {
    voteDiameter,
    sideDiameter,
    voteGap: PROFILE_VOTE_GAP,
    centerNudge: 0,
    stacked: true,
    rowMinHeight: voteDiameter + sideDiameter + 16,
  };
}
