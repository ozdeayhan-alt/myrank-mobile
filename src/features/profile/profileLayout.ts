/** Profil üst bölümü (avatar, skor, açılır kartlar) yatay iç boşluk */
export const PROFILE_HORIZONTAL_PADDING = 24;

/** Kenar butonları (mesaj, takip) ekran kenarından hafif içeride */
export const PROFILE_EDGE_INSET = 12;

/** Sağ üst menü ikonu ekran kenarından içeride */
export const PROFILE_MENU_RIGHT_INSET = 16;

/** Segment sırası üçgeni, Toplam Puan kartından iki tık (16px) dar */
export const PROFILE_SEGMENT_BADGE_INSET = 16;

export function getProfileScoreCardWidth(screenWidth: number): number {
  return screenWidth - PROFILE_HORIZONTAL_PADDING * 2;
}

export function getProfileSegmentBadgeWidth(screenWidth: number): number {
  return getProfileScoreCardWidth(screenWidth) - PROFILE_SEGMENT_BADGE_INSET;
}

export function getProfileSegmentBadgeHeight(badgeWidth: number): number {
  return Math.round(badgeWidth * 0.42);
}

/** Segment sırası üçgeni ile Toplam Puan kartı arası boşluk */
export const PROFILE_SEGMENT_TO_SCORE_GAP = 8;

/** Alçalt/Yükselt optik ortalama düzeltmesi (sağa kaydırma) */
export const PROFILE_VOTE_CENTER_NUDGE = 6;

const PROFILE_VOTE_DIAMETER_MAX = 72;
const PROFILE_VOTE_DIAMETER_MIN = 56;
const PROFILE_SIDE_DIAMETER_MAX = 64;
const PROFILE_SIDE_DIAMETER_MIN = 50;
const PROFILE_VOTE_GAP = 4;
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
