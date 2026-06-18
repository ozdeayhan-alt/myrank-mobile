import {
  FILTER_FIELDS,
  formatFilterChipValue,
} from "@/features/filters/config/filterFields";
import type { UserMetadata } from "@/features/profile/types";

export function formatRankingCategoriesLine(
  metadata: UserMetadata | undefined
): string {
  if (!metadata) {
    return "";
  }

  return FILTER_FIELDS.map(({ key }) => formatFilterChipValue(key, metadata))
    .filter((value) => value !== "—")
    .join(" · ");
}
