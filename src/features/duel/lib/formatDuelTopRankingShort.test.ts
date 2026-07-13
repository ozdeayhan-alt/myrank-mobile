import { EMPTY_METADATA } from "@/features/profile/types";
import {
  formatDuelTopRankingShort,
  formatTopRankingShort,
} from "./formatDuelTopRankingShort";

describe("formatDuelTopRankingShort", () => {
  it("formats city ranking in short form", () => {
    expect(
      formatDuelTopRankingShort("city", { ...EMPTY_METADATA, city: "İzmir" }, 7)
    ).toBe("İzmir 7.si");
  });

  it("formats country ranking in short form", () => {
    expect(
      formatDuelTopRankingShort(
        "country",
        { ...EMPTY_METADATA, country: "Türkiye" },
        3
      )
    ).toBe("Türkiye 3.ü");
  });

  it("formats via TopRanking helper", () => {
    expect(
      formatTopRankingShort(
        { rank: 12, key: "city", label: "ignored" },
        { ...EMPTY_METADATA, city: "İzmir" }
      )
    ).toBe("İzmir 12.si");
  });
});
