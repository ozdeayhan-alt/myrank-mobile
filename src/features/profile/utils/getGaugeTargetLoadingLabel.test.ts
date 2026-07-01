import { getGaugeTargetLoadingLabel } from "./getGaugeTargetLoadingLabel";

describe("getGaugeTargetLoadingLabel", () => {
  it("returns up loading copy by default", () => {
    expect(getGaugeTargetLoadingLabel(null)).toBe(
      "Yükselme sıralaması hesaplanıyor"
    );
    expect(getGaugeTargetLoadingLabel("up")).toBe(
      "Yükselme sıralaması hesaplanıyor"
    );
  });

  it("returns down loading copy", () => {
    expect(getGaugeTargetLoadingLabel("down")).toBe(
      "Alçaltma sıralaması hesaplanıyor"
    );
  });
});
