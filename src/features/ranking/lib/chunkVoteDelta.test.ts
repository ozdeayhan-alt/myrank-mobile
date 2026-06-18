import { chunkVoteDelta, VOTE_FLUSH_CHUNK_SIZE } from "./chunkVoteDelta";

describe("chunkVoteDelta", () => {
  it("returns empty for zero", () => {
    expect(chunkVoteDelta(0)).toEqual([]);
  });

  it("passes through deltas within chunk size", () => {
    expect(chunkVoteDelta(1)).toEqual([1]);
    expect(chunkVoteDelta(-50)).toEqual([-50]);
    expect(chunkVoteDelta(200)).toEqual([200]);
    expect(chunkVoteDelta(-200)).toEqual([-200]);
  });

  it("splits 500 tap burst into 200+200+100", () => {
    expect(chunkVoteDelta(500)).toEqual([200, 200, 100]);
  });

  it("splits 2000 tap burst into ten 200 chunks", () => {
    expect(chunkVoteDelta(2000)).toEqual(Array(10).fill(200));
  });

  it("splits negative burst symmetrically", () => {
    expect(chunkVoteDelta(-500)).toEqual([-200, -200, -100]);
  });

  it("uses VOTE_FLUSH_CHUNK_SIZE by default", () => {
    expect(VOTE_FLUSH_CHUNK_SIZE).toBe(200);
    expect(chunkVoteDelta(201)).toEqual([200, 1]);
  });
});
