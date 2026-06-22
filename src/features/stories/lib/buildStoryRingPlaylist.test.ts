import { describe, expect, it } from "@jest/globals";
import type { Story } from "../constants/types";
import {
  buildSingleUserStoryPlaylist,
  buildStoryRingPlaylist,
  findStoryIndexInPlaylist,
} from "./buildStoryRingPlaylist";

function story(id: string, userId: string, createdAt: number): Story {
  return {
    id,
    userId,
    authorDisplayName: userId,
    authorPhotoURL: null,
    mediaType: "image",
    mediaURL: "https://example.com/a.jpg",
    posterURL: null,
    caption: null,
    createdAt,
    expiresAt: createdAt + 86400000,
  };
}

describe("buildStoryRingPlaylist", () => {
  it("orders self first then others, chronological within user", () => {
    const feed = [
      story("b2", "bot_b", 200),
      story("a1", "bot_a", 100),
      story("me1", "me", 50),
      story("a2", "bot_a", 150),
    ];

    const playlist = buildStoryRingPlaylist(feed, "me");
    expect(playlist.map((s) => s.id)).toEqual(["me1", "b2", "a1", "a2"]);
  });

  it("finds start index by story id", () => {
    const playlist = [story("a", "u1", 1), story("b", "u2", 2)];
    expect(findStoryIndexInPlaylist(playlist, "b")).toBe(1);
    expect(findStoryIndexInPlaylist(playlist, "missing")).toBe(0);
  });

  it("buildSingleUserStoryPlaylist keeps only one user, chronological", () => {
    const feed = [
      story("a2", "bot_a", 200),
      story("b1", "bot_b", 50),
      story("a1", "bot_a", 100),
    ];
    expect(buildSingleUserStoryPlaylist(feed, "bot_a").map((s) => s.id)).toEqual(
      ["a1", "a2"]
    );
  });
});
