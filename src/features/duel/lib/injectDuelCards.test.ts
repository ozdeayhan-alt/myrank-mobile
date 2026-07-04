import { duelIntervalForCardIndex } from "../constants";
import { injectDuelCards } from "./injectDuelCards";
import type { FeedV2ListItem } from "@/features/feed-v2/engine/FeedEngine.types";

describe("injectDuelCards", () => {
  it("keeps duel interval within 8-12", () => {
    for (let index = 0; index < 20; index += 1) {
      const interval = duelIntervalForCardIndex(index);
      expect(interval).toBeGreaterThanOrEqual(8);
      expect(interval).toBeLessThanOrEqual(12);
    }
  });

  it("inserts duel cards after enough posts", () => {
    const posts: FeedV2ListItem[] = Array.from({ length: 20 }, (_, index) => ({
      kind: "whisp",
      key: `post-${index}`,
      post: {
        id: `post-${index}`,
        authorId: "author",
        postScore: 0,
        likeCount: 0,
        dislikeCount: 0,
        shareCount: 0,
        saveCount: 0,
        commentCount: 0,
      },
    }));

    const withDuels = injectDuelCards(posts);
    const duelCount = withDuels.filter((item) => item.kind === "duel").length;
    expect(duelCount).toBeGreaterThanOrEqual(1);
    expect(withDuels.length).toBeGreaterThan(posts.length);
  });
});
