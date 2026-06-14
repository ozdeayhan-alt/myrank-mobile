import {
  FILTER_FIELDS,
  type FilterFieldKey,
} from "@/features/filters/config/filterFields";

export type BioCategoryVisibility = Record<FilterFieldKey, boolean>;

export const EMPTY_BIO_CATEGORY_VISIBILITY: BioCategoryVisibility = {
  country: false,
  city: false,
  age: false,
  gender: false,
  profession: false,
  maritalStatus: false,
};

export function parseBioCategoryVisibility(
  data: Record<string, unknown>
): BioCategoryVisibility {
  const raw = data.bioCategoryVisibility;
  if (raw && typeof raw === "object") {
    const source = raw as Record<string, unknown>;
    const next = { ...EMPTY_BIO_CATEGORY_VISIBILITY };
    for (const { key } of FILTER_FIELDS) {
      next[key] = source[key] === true;
    }
    return next;
  }

  if (data.showCategoriesInBio === true) {
    return FILTER_FIELDS.reduce(
      (acc, { key }) => {
        acc[key] = true;
        return acc;
      },
      { ...EMPTY_BIO_CATEGORY_VISIBILITY }
    );
  }

  return { ...EMPTY_BIO_CATEGORY_VISIBILITY };
}

export function hasVisibleBioCategory(
  visibility: BioCategoryVisibility
): boolean {
  return FILTER_FIELDS.some(({ key }) => visibility[key]);
}
