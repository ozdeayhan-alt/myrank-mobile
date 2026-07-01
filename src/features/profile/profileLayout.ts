/** Profil üst bölümü (avatar, skor, açılır kartlar) yatay iç boşluk */
export const PROFILE_HORIZONTAL_PADDING = 24;

/** Kenar butonları (mesaj, takip) ekran kenarından hafif içeride */
export const PROFILE_EDGE_INSET = 12;

/** Sağ üst menü ikonu ekran kenarından içeride (üç nokta kırpılmasın) */
export const PROFILE_MENU_RIGHT_INSET = 20;

/** Segment sırası üçgeni, Toplam Puan kartından iki tık (16px) dar — @deprecated üçgen kaldırıldı */
export const PROFILE_SEGMENT_BADGE_INSET = 16;

/** Profil avatar çapı (story ring dahil görünür alan) */
export const PROFILE_AVATAR_SIZE = 108;

/** Avatar ile MyRank madalyası arası boşluk */
export const PROFILE_MEDAL_GAP = 12;

/** İsim/bio ile Toplam Puan bloğu arası */
export const PROFILE_SCORE_SECTION_MARGIN_TOP = 20;

/** Gauge ile Alçalt/Yükselt satırı arası */
export const PROFILE_VOTE_CONTROLS_MARGIN_TOP = 20;

export function getProfileScoreCardWidth(screenWidth: number): number {
  return screenWidth - PROFILE_HORIZONTAL_PADDING * 2;
}

const GAUGE_WIDTH_RATIO = 0.9;
const GAUGE_WIDTH_MIN = 240;
const GAUGE_WIDTH_MAX = 360;
const BAR_HEIGHT = 14;
const BAR_STROKE_RATIO = 0.04;
const BAR_STROKE_MIN = 10;
const BAR_STROKE_MAX = 12;
const BAR_END_INSET = 2;
const FONT_SCALE_CLAMP_MAX = 1.25;

export type ProfileSegmentGaugeLayout = {
  containerWidth: number;
  gaugeWidth: number;
  gaugeHeight: number;
  barX: number;
  barY: number;
  barLength: number;
  barStroke: number;
  trackStroke: number;
  trackLength: number;
  metaAreaHeight: number;
  tpFontSize: number;
  tpLineHeight: number;
  metaLabelFontSize: number;
  metaValueFontSize: number;
  metaTargetFontSize: number;
  segmentLabelGap: number;
  stackedMeta: boolean;
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
  const gaugeHeight = BAR_HEIGHT;
  const barStroke = Math.min(
    BAR_STROKE_MAX,
    Math.max(BAR_STROKE_MIN, Math.round(gaugeWidth * BAR_STROKE_RATIO))
  );
  const trackStroke = barStroke + 1;
  const barX = BAR_END_INSET;
  const barLength = Math.max(0, gaugeWidth - BAR_END_INSET * 2);
  const barY = gaugeHeight / 2;
  const trackLength = barLength;
  const metaAreaHeight = Math.round(gaugeWidth * 0.08) + 20;
  const segmentLabelGap = 6;
  const stackedMeta = gaugeWidth < 260 || contentWidth < 300;

  return {
    containerWidth: contentWidth,
    gaugeWidth,
    gaugeHeight,
    barX,
    barY,
    barLength,
    barStroke,
    trackStroke,
    trackLength,
    metaAreaHeight,
    tpFontSize: Math.round(Math.min(28, Math.max(22, gaugeWidth * 0.075))),
    tpLineHeight: Math.round(Math.min(32, Math.max(26, gaugeWidth * 0.085))),
    metaLabelFontSize: Math.max(8, Math.round(gaugeWidth * 0.032)),
    metaValueFontSize: Math.max(10, Math.round(gaugeWidth * 0.038)),
    metaTargetFontSize: Math.max(9, Math.round(gaugeWidth * 0.034)),
    segmentLabelGap,
    stackedMeta,
    gaugeInfoIconSize: Math.max(13, Math.round(gaugeWidth * 0.042)),
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

const PROFILE_VOTE_DIAMETER_MAX = 54;
const PROFILE_VOTE_DIAMETER_MIN = 48;
const PROFILE_VOTE_GAP = 10;
const SIDE_BUTTON_HEIGHT_RATIO = 0.72;
const SIDE_BUTTON_HEIGHT_MIN = 34;
const SIDE_BUTTON_HEIGHT_MAX = 42;
const SIDE_BUTTON_WIDTH_MIN = 96;
const SIDE_BUTTON_WIDTH_MAX = 112;
/** Yan buton ile oy dairesi arası minimum boşluk (space-between düzeni) */
const SIDE_BUTTON_VOTE_GAP = 12;
/** Yükselt/Alçalt alt etiketi için yan butonlarda boşluk (hiza) */
export const PROFILE_VOTE_BUTTON_LABEL_RESERVE = 16;
/** Gölge / hitSlop taşması için satır genişliği güvenlik payı */
const PROFILE_VOTE_ROW_SAFETY = 12;

export type ProfileVoteControlLayout = {
  voteDiameter: number;
  sideDiameter: number;
  /** Mesajlarım / Takiplerim dikdörtgen yüksekliği (oy dairesinden kısa) */
  sideButtonHeight: number;
  sideButtonMaxWidth: number;
  voteGap: number;
  centerNudge: number;
  /** Dar ekranda oy üstte, takip/mesaj altta */
  stacked: boolean;
  rowMinHeight: number;
};

function computeSideButtonMaxWidth(
  contentWidth: number,
  voteDiameter: number,
  voteGap: number,
  centerNudge: number,
  stacked: boolean
): number {
  if (stacked) {
    const halfSlot = Math.floor((contentWidth - voteGap) / 2);
    return Math.min(
      SIDE_BUTTON_WIDTH_MAX,
      Math.max(SIDE_BUTTON_WIDTH_MIN, halfSlot - 4)
    );
  }

  const voteBlockWidth = voteDiameter * 2 + voteGap + centerNudge;
  const sideSlot = Math.max(0, (contentWidth - voteBlockWidth) / 2);
  const cappedBySlot = Math.max(
    SIDE_BUTTON_WIDTH_MIN,
    Math.min(sideSlot - SIDE_BUTTON_VOTE_GAP, SIDE_BUTTON_WIDTH_MAX)
  );
  return Math.min(SIDE_BUTTON_WIDTH_MAX, cappedBySlot);
}

function computeSideButtonHeight(voteDiameter: number): number {
  return Math.round(
    Math.min(
      SIDE_BUTTON_HEIGHT_MAX,
      Math.max(SIDE_BUTTON_HEIGHT_MIN, voteDiameter * SIDE_BUTTON_HEIGHT_RATIO)
    )
  );
}

function profileVoteRowWidth(
  voteDiameter: number,
  sideButtonWidth: number,
  centerNudge: number
): number {
  return (
    sideButtonWidth * 2 +
    voteDiameter * 2 +
    PROFILE_VOTE_GAP +
    centerNudge
  );
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

  while (voteDiameter > PROFILE_VOTE_DIAMETER_MIN) {
    const sideButtonMaxWidth = computeSideButtonMaxWidth(
      contentWidth,
      voteDiameter,
      PROFILE_VOTE_GAP,
      centerNudge,
      false
    );
    if (
      profileVoteRowWidth(voteDiameter, sideButtonMaxWidth, centerNudge) <=
      availableWidth
    ) {
      break;
    }
    voteDiameter -= 2;
  }

  const sideButtonMaxWidth = computeSideButtonMaxWidth(
    contentWidth,
    voteDiameter,
    PROFILE_VOTE_GAP,
    centerNudge,
    false
  );

  const singleRowFits =
    profileVoteRowWidth(voteDiameter, sideButtonMaxWidth, centerNudge) <=
    availableWidth;

  if (singleRowFits) {
    return {
      voteDiameter,
      sideDiameter: voteDiameter,
      sideButtonHeight: computeSideButtonHeight(voteDiameter),
      sideButtonMaxWidth,
      voteGap: PROFILE_VOTE_GAP,
      centerNudge,
      stacked: false,
      rowMinHeight: voteDiameter + PROFILE_VOTE_BUTTON_LABEL_RESERVE + 4,
    };
  }

  voteDiameter = Math.max(
    PROFILE_VOTE_DIAMETER_MIN,
    Math.min(PROFILE_VOTE_DIAMETER_MAX, Math.floor(contentWidth * 0.24))
  );

  return {
    voteDiameter,
    sideDiameter: voteDiameter,
    sideButtonHeight: computeSideButtonHeight(voteDiameter),
    sideButtonMaxWidth: computeSideButtonMaxWidth(
      contentWidth,
      voteDiameter,
      PROFILE_VOTE_GAP,
      0,
      true
    ),
    voteGap: PROFILE_VOTE_GAP,
    centerNudge: 0,
    stacked: true,
    rowMinHeight: voteDiameter * 2 + 24,
  };
}
