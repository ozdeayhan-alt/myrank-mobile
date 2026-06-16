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
