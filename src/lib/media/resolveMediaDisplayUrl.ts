/**
 * Geçersiz download token'lı Firebase URL'lerinde public Storage kuralları devreye girsin.
 */
export function resolveMediaDisplayUrl(url: string | undefined): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.includes("firebasestorage.googleapis.com")) {
      return trimmed;
    }

    if (parsed.searchParams.has("token")) {
      parsed.searchParams.delete("token");
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
}
