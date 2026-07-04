import {
  getVoteDisplayScore,
  initVoteDisplay,
  postVoteDisplayKey,
  profileVoteDisplayKey,
  resetVoteDisplay,
  subscribeVoteDisplay,
  syncVoteDisplay,
} from "./voteDisplayStore";

describe("voteDisplayStore", () => {
  const postKey = postVoteDisplayKey("post-1");
  const profileKey = profileVoteDisplayKey("user-1");

  beforeEach(() => {
    resetVoteDisplay(postKey, 0);
    resetVoteDisplay(profileKey, 100);
  });

  it("returns server score plus pending delta", () => {
    initVoteDisplay(postKey, 10);
    syncVoteDisplay(postKey, 10, 2);
    expect(getVoteDisplayScore(postKey)).toBe(12);
  });

  it("notifies subscribers on sync", () => {
    initVoteDisplay(postKey, 5);
    const listener = jest.fn();
    const unsubscribe = subscribeVoteDisplay(postKey, listener);

    syncVoteDisplay(postKey, 5, 1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getVoteDisplayScore(postKey)).toBe(6);

    unsubscribe();
    syncVoteDisplay(postKey, 5, 2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reset clears pending votes", () => {
    syncVoteDisplay(profileKey, 100, 3);
    resetVoteDisplay(profileKey, 105);
    expect(getVoteDisplayScore(profileKey)).toBe(105);
  });
});
