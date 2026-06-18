export function rankingEnsureError(
  reason?: string,
  options?: { profileSaved?: boolean }
): Error {
  const prefix = options?.profileSaved ? "Profil kaydedildi ancak " : "";

  if (reason === "metadata_incomplete") {
    return new Error(
      `${prefix}sıralama segmentleri oluşturulamadı: eksik kategori bilgisi.`
    );
  }

  return new Error(
    `${prefix}sıralama listelerine eklenemedi. Lütfen tekrar deneyin.`
  );
}
