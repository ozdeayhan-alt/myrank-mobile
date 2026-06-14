import { BIO_MAX_LENGTH } from "../constants";
import { normalizeBio } from "./normalizeBio";

describe("normalizeBio", () => {
  it("trims whitespace", () => {
    expect(normalizeBio("  merhaba  ")).toBe("merhaba");
  });

  it("caps length at BIO_MAX_LENGTH", () => {
    const long = "a".repeat(BIO_MAX_LENGTH + 20);
    expect(normalizeBio(long)).toHaveLength(BIO_MAX_LENGTH);
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeBio("   ")).toBe("");
  });
});
