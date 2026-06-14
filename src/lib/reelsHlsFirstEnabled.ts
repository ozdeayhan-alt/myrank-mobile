/**
 * Reels oynatıcıda HLS kaynağını MP4'ten önce dene.
 * Varsayılan kapalı — bozuk HLS post'larda MP4 fallback korunur.
 * Açmak: EXPO_PUBLIC_REELS_HLS_FIRST=true
 */
export function isReelsHlsFirstEnabled(): boolean {
  const raw = process.env.EXPO_PUBLIC_REELS_HLS_FIRST?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}
