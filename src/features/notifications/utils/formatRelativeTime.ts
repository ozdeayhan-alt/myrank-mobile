import { normalizeDate } from "@/lib/normalizeDate";

export function formatRelativeTime(date: Date | string | null): string {
  const normalized = normalizeDate(date);
  if (!normalized) {
    return "";
  }

  const diffMs = Date.now() - normalized.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} sa önce`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} gün önce`;

  return normalized.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}
