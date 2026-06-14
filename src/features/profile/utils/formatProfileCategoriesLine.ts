import {
  FILTER_FIELDS,
  formatFilterChipValue,
} from "@/features/filters/config/filterFields";
import type { UserMetadata } from "../types";
import type { BioCategoryVisibility } from "./bioCategoryVisibility";

export function formatProfileCategoriesLine(
  metadata: UserMetadata,
  visibility: BioCategoryVisibility
): string {
  return FILTER_FIELDS.filter(({ key }) => visibility[key])
    .map(({ key }) => formatFilterChipValue(key, metadata))
    .filter((value) => value !== "—")
    .join(" · ");
}
