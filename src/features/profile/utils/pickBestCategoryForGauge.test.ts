import type { CategoryRanking } from "../api/fetchProfileRankings";
import { EMPTY_METADATA } from "../types";
import { pickBestCategoryForGauge } from "./pickBestCategoryForGauge";

describe("pickBestCategoryForGauge", () => {
  const metadata = {
    ...EMPTY_METADATA,
    city: "İzmir",
    profession: "Yazar",
  };

  it("returns null when no valid category ranks", () => {
    const rankings: CategoryRanking[] = [
      { key: "city", rank: null, isOfficial: true },
      { key: "global", rank: 12, isOfficial: true },
    ];
    expect(pickBestCategoryForGauge(rankings, metadata)).toBeNull();
  });

  it("ignores global and picks the best category rank", () => {
    const rankings: CategoryRanking[] = [
      { key: "city", rank: 5, isOfficial: true },
      { key: "profession", rank: 20, isOfficial: true },
      { key: "global", rank: 12, isOfficial: true },
    ];

    expect(pickBestCategoryForGauge(rankings, metadata)).toEqual({
      key: "city",
      rank: 5,
      segmentKey: "country:|city:İzmir|gender:|age:|profession:|maritalStatus:",
    });
  });

  it("prefers official rankings over estimated", () => {
    const rankings: CategoryRanking[] = [
      { key: "city", rank: 2, isOfficial: false },
      { key: "profession", rank: 5, isOfficial: true },
    ];

    expect(pickBestCategoryForGauge(rankings, metadata)?.key).toBe("profession");
    expect(pickBestCategoryForGauge(rankings, metadata)?.rank).toBe(5);
  });

  it("prefers a category with rank > 1 over rank 1", () => {
    const rankings: CategoryRanking[] = [
      { key: "profession", rank: 1, isOfficial: true },
      { key: "city", rank: 5, isOfficial: true },
    ];

    expect(pickBestCategoryForGauge(rankings, metadata)?.key).toBe("city");
    expect(pickBestCategoryForGauge(rankings, metadata)?.rank).toBe(5);
  });
});
