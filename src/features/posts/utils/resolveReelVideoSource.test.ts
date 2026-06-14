import type { Post } from "../types";
import { isReelsHlsFirstEnabled } from "@/lib/reelsHlsFirstEnabled";
import { resolveReelVideoSources } from "./resolveReelVideoSource";

jest.mock("@/lib/reelsHlsFirstEnabled", () => ({
  isReelsHlsFirstEnabled: jest.fn(() => false),
}));

const mockIsReelsHlsFirstEnabled = jest.mocked(isReelsHlsFirstEnabled);

const samplePost: Post = {
  id: "p1",
  authorId: "u1",
  postScore: 0,
  likeCount: 0,
  dislikeCount: 0,
  shareCount: 0,
  saveCount: 0,
  commentCount: 0,
  contentType: "video",
  mediaURL: "https://cdn.example.com/video.mp4",
  hlsURL: "https://cdn.example.com/master.m3u8",
};

describe("resolveReelVideoSources", () => {
  beforeEach(() => {
    mockIsReelsHlsFirstEnabled.mockReturnValue(false);
  });

  it("prefers MP4 before HLS by default", () => {
    const sources = resolveReelVideoSources(samplePost);
    expect(sources).toHaveLength(2);
    expect(sources[0]).toBe("https://cdn.example.com/video.mp4");
    expect(sources[1]).toEqual({
      uri: "https://cdn.example.com/master.m3u8",
      contentType: "hls",
    });
  });

  it("prefers HLS before MP4 when feature flag is on", () => {
    mockIsReelsHlsFirstEnabled.mockReturnValue(true);

    const sources = resolveReelVideoSources(samplePost);
    expect(sources[0]).toEqual({
      uri: "https://cdn.example.com/master.m3u8",
      contentType: "hls",
    });
    expect(sources[1]).toBe("https://cdn.example.com/video.mp4");
  });

  it("deduplicates when only one source exists", () => {
    const mp4Only: Post = { ...samplePost, hlsURL: undefined };
    expect(resolveReelVideoSources(mp4Only)).toEqual([
      "https://cdn.example.com/video.mp4",
    ]);
  });
});
