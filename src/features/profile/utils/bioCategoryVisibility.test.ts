import {
  EMPTY_BIO_CATEGORY_VISIBILITY,
  hasVisibleBioCategory,
  parseBioCategoryVisibility,
} from "./bioCategoryVisibility";

describe("parseBioCategoryVisibility", () => {
  it("returns empty visibility when field is missing", () => {
    expect(parseBioCategoryVisibility({})).toEqual(
      EMPTY_BIO_CATEGORY_VISIBILITY
    );
  });

  it("reads per-field toggles from bioCategoryVisibility object", () => {
    expect(
      parseBioCategoryVisibility({
        bioCategoryVisibility: {
          country: true,
          city: false,
          age: true,
        },
      })
    ).toEqual({
      ...EMPTY_BIO_CATEGORY_VISIBILITY,
      country: true,
      age: true,
    });
  });

  it("migrates legacy showCategoriesInBio flag to all fields visible", () => {
    const result = parseBioCategoryVisibility({ showCategoriesInBio: true });
    expect(hasVisibleBioCategory(result)).toBe(true);
    expect(result.country).toBe(true);
    expect(result.profession).toBe(true);
  });
});

describe("hasVisibleBioCategory", () => {
  it("returns false when all fields are hidden", () => {
    expect(hasVisibleBioCategory(EMPTY_BIO_CATEGORY_VISIBILITY)).toBe(false);
  });

  it("returns true when at least one field is visible", () => {
    expect(
      hasVisibleBioCategory({
        ...EMPTY_BIO_CATEGORY_VISIBILITY,
        gender: true,
      })
    ).toBe(true);
  });
});
