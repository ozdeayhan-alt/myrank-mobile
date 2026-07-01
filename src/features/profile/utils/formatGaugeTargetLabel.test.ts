import { EMPTY_METADATA } from "../types";
import { formatGaugeTargetLabel } from "./formatGaugeTargetLabel";

describe("formatGaugeTargetLabel", () => {
  const metadata = {
    ...EMPTY_METADATA,
    gender: "Erkek",
    city: "İzmir",
    profession: "Doktor",
  };

  it("formats gender up target from active rung rank", () => {
    expect(
      formatGaugeTargetLabel({
        key: "gender",
        metadata,
        targetRank: 2,
        direction: "up",
      })
    ).toBe("Erkeklerde 2. sıraya yükselmek için");
  });

  it("formats gender down target from active rung rank", () => {
    expect(
      formatGaugeTargetLabel({
        key: "gender",
        metadata,
        targetRank: 4,
        direction: "down",
      })
    ).toBe("Erkeklerde 4. sıraya düşmek için");
  });

  it("formats city up target", () => {
    expect(
      formatGaugeTargetLabel({
        key: "city",
        metadata,
        targetRank: 4,
        direction: "up",
      })
    ).toBe("İzmir'de 4. sıraya yükselmek için");
  });

  it("formats profession up target for students", () => {
    expect(
      formatGaugeTargetLabel({
        key: "profession",
        metadata: { ...EMPTY_METADATA, profession: "Öğrenci" },
        targetRank: 5,
        direction: "up",
      })
    ).toBe("Öğrencilerde 5. sıraya yükselmek için");
  });

  it("handles pinnacle state on up", () => {
    expect(
      formatGaugeTargetLabel({
        key: "gender",
        metadata,
        targetRank: null,
        direction: "up",
        atPinnacle: true,
      })
    ).toBe("Zirvedesin zaten");
  });

  it("does not show pinnacle text on up without atPinnacle flag", () => {
    expect(
      formatGaugeTargetLabel({
        key: "gender",
        metadata,
        targetRank: null,
        direction: "up",
        noTarget: true,
      })
    ).toBe("");
  });

  it("handles global last on down", () => {
    expect(
      formatGaugeTargetLabel({
        key: "global",
        metadata,
        targetRank: null,
        direction: "down",
        atGlobalLast: true,
      })
    ).toBe("Genel sıralamada son sıradasın");
  });
});
