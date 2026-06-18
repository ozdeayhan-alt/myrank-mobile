/** Sistem tarafından oluşturulan lig / topluluk profilleri. */
export function isSystemProfileUserId(userId: string | null | undefined): boolean {
  return typeof userId === "string" && userId.startsWith("bot_");
}
