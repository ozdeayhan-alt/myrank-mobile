import type { DuelMatch } from "../types";
import { duelTotalVoteCount, formatDuelVoteCountLabel } from "./formatDuelVoteCount";

function makeMatch(
  overrides: Partial<DuelMatch["postA"]> = {}
): DuelMatch {
  return {
    matchId: "a_b",
    postA: {
      id: "a",
      authorId: "u1",
      authorDisplayName: "Ali",
      postScore: 10,
      likeCount: 100,
      dislikeCount: 20,
      shareCount: 0,
      saveCount: 0,
      commentCount: 0,
      ...overrides,
    },
    postB: {
      id: "b",
      authorId: "u2",
      authorDisplayName: "Mehmet",
      postScore: 8,
      likeCount: 50,
      dislikeCount: 10,
      shareCount: 0,
      saveCount: 0,
      commentCount: 0,
    },
  };
}

describe("formatDuelVoteCount", () => {
  it("sums engagement from both posts", () => {
    expect(duelTotalVoteCount(makeMatch())).toBe(180);
  });

  it("formats Turkish locale label", () => {
    expect(formatDuelVoteCountLabel(makeMatch())).toBe("180 kişi oy verdi");
  });

  it("shows invite when no votes yet", () => {
    const match = makeMatch({
      likeCount: 0,
      dislikeCount: 0,
    });
    match.postB.likeCount = 0;
    match.postB.dislikeCount = 0;
    expect(formatDuelVoteCountLabel(match)).toBe("Oy vermeye başla");
  });
});
