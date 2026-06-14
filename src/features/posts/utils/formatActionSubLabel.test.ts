import { formatActionSubLabel } from "./formatActionSubLabel";

describe("formatActionSubLabel", () => {
  it("returns comment bonus label", () => {
    expect(formatActionSubLabel("comment", false)).toBe("+33");
  });

  it("returns inactive share/save bonus labels", () => {
    expect(formatActionSubLabel("share", false)).toBe("+66");
    expect(formatActionSubLabel("save", false)).toBe("+66");
  });

  it("returns active share/save bonus labels", () => {
    expect(formatActionSubLabel("share", true)).toBe("+1");
    expect(formatActionSubLabel("save", true)).toBe("+1");
  });
});
