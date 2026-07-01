import type { CategoryRanking } from "../api/fetchProfileRankings";
import { EMPTY_METADATA } from "../types";
import { formatAchievementBadgeLabel } from "./formatAchievementBadgeLabel";
import { pickTopRanking } from "./pickTopRanking";

describe("formatAchievementBadgeLabel", () => {
  it("formats profession ranking", () => {
    expect(
      formatAchievementBadgeLabel(
        "profession",
        { ...EMPTY_METADATA, profession: "Yazar" },
        1
      )
    ).toBe("Yazar Kategorisinde 1.");
  });

  it("formats city ranking", () => {
    expect(
      formatAchievementBadgeLabel(
        "city",
        { ...EMPTY_METADATA, city: "İzmir" },
        12
      )
    ).toBe("İzmir Sıralamasında 12.");
  });
});

describe("pickTopRanking", () => {
  const metadata = {
    ...EMPTY_METADATA,
    city: "İzmir",
    profession: "Yazar",
  };

  it("returns null when no valid ranks", () => {
    const rankings: CategoryRanking[] = [
      { key: "city", rank: null, isOfficial: true },
      { key: "profession", rank: null, isOfficial: true },
    ];
    expect(pickTopRanking(rankings, metadata)).toBeNull();
  });

  it("picks the lowest rank as top achievement", () => {
    const rankings: CategoryRanking[] = [
      { key: "city", rank: 44, isOfficial: true },
      { key: "profession", rank: 1, isOfficial: true },
      { key: "global", rank: 500, isOfficial: true },
    ];

    expect(pickTopRanking(rankings, metadata)).toEqual({
      rank: 1,
      label: "Yazar Kategorisinde 1.",
    });
  });

  it("prefers official rankings over estimated when choosing pool", () => {
    const rankings: CategoryRanking[] = [
      { key: "city", rank: 2, isOfficial: false },
      { key: "profession", rank: 5, isOfficial: true },
    ];

    expect(pickTopRanking(rankings, metadata)?.rank).toBe(5);
  });

  it("uses estimated rankings when no official ranks exist", () => {
    const rankings: CategoryRanking[] = [
      { key: "city", rank: 8, isOfficial: false },
      { key: "profession", rank: 3, isOfficial: false },
    ];

    expect(pickTopRanking(rankings, metadata)?.rank).toBe(3);
  });
});
