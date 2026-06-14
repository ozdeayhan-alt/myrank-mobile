import { normalizeDate } from "./normalizeDate";

describe("normalizeDate", () => {
  it("returns null for empty values", () => {
    expect(normalizeDate(null)).toBeNull();
    expect(normalizeDate(undefined)).toBeNull();
  });

  it("accepts Date instances", () => {
    const date = new Date("2024-06-01T12:00:00.000Z");
    expect(normalizeDate(date)?.toISOString()).toBe(date.toISOString());
  });

  it("parses ISO strings from persisted cache", () => {
    const iso = "2024-06-01T12:00:00.000Z";
    expect(normalizeDate(iso)?.toISOString()).toBe(iso);
  });

  it("returns null for invalid strings", () => {
    expect(normalizeDate("not-a-date")).toBeNull();
  });
});
