describe("resolveMediaDisplayUrl", () => {
  const originalProxyOrigin = process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN;

  afterEach(() => {
    if (originalProxyOrigin === undefined) {
      delete process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN;
    } else {
      process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN = originalProxyOrigin;
    }
    jest.resetModules();
  });

  it("removes firebase download token for generic display", async () => {
    const { resolveMediaDisplayUrl } = await import("./resolveMediaDisplayUrl");
    expect(
      resolveMediaDisplayUrl(
        "https://firebasestorage.googleapis.com/v0/b/bucket/o/file.mp4?alt=media&token=abc"
      )
    ).toBe(
      "https://firebasestorage.googleapis.com/v0/b/bucket/o/file.mp4?alt=media"
    );
  });

  it("keeps token for poster display", async () => {
    const { resolvePosterDisplayUrl } = await import("./resolveMediaDisplayUrl");
    expect(
      resolvePosterDisplayUrl(
        "https://firebasestorage.googleapis.com/v0/b/bucket/o/poster.jpg?alt=media&token=abc"
      )
    ).toBe(
      "https://firebasestorage.googleapis.com/v0/b/bucket/o/poster.jpg?alt=media&token=abc"
    );
  });

  it("derives poster url from fast mp4 media url", async () => {
    const { derivePosterUrlFromMediaUrl } = await import(
      "./resolveMediaDisplayUrl"
    );
    expect(
      derivePosterUrlFromMediaUrl(
        "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/posts%2Fu1%2F123_fast.mp4?alt=media"
      )
    ).toBe(
      "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/posts%2Fu1%2F123_poster.jpg?alt=media"
    );
  });

  it("resolveVideoPosterUrl falls back to mediaURL", async () => {
    const { resolveVideoPosterUrl } = await import("./resolveMediaDisplayUrl");
    expect(
      resolveVideoPosterUrl({
        mediaURL:
          "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/posts%2Fu1%2F123_fast.mp4?alt=media",
      })
    ).toContain("123_poster.jpg");
  });

  it("resolveVideoPosterUrl prefers posterURL field", async () => {
    const { resolveVideoPosterUrl } = await import("./resolveMediaDisplayUrl");
    expect(
      resolveVideoPosterUrl({
        posterURL:
          "https://firebasestorage.googleapis.com/v0/b/bucket/o/custom.jpg?alt=media&token=tok",
        mediaURL:
          "https://firebasestorage.googleapis.com/v0/b/bucket/o/posts%2Fu1%2F9_fast.mp4?alt=media",
      })
    ).toContain("token=tok");
  });

  it("listVideoPosterCandidateUrls normalizes legacy bucket poster", async () => {
    const { listVideoPosterCandidateUrls } = await import(
      "./resolveMediaDisplayUrl"
    );
    const candidates = listVideoPosterCandidateUrls({
      posterURL:
        "https://firebasestorage.googleapis.com/v0/b/myrank-d62b9-storage/o/posts%2Fu1%2F9_poster.jpg?alt=media&token=tok",
      mediaURL:
        "https://firebasestorage.googleapis.com/v0/b/myrank-d62b9-storage/o/posts%2Fu1%2F9_fast.mp4?alt=media",
    });
    expect(candidates.some((url) => url.includes("myrankapp-d62b9"))).toBe(
      true
    );
  });

  it("listAvatarDisplayCandidateUrls includes tokenless and proxy variants", async () => {
    process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN = "https://myrank.com.tr";
    const { listAvatarDisplayCandidateUrls } = await import(
      "./resolveMediaDisplayUrl"
    );
    const candidates = listAvatarDisplayCandidateUrls(
      "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/profiles%2Fu1%2Favatar.jpg?alt=media&token=abc"
    );
    expect(candidates.length).toBeGreaterThan(2);
    expect(candidates.some((url) => !url.includes("token="))).toBe(true);
    expect(candidates.some((url) => url.includes("myrank.com.tr/fb-media"))).toBe(
      true
    );
  });

  it("resolveVideoStreamUrl uses proxy for MP4 when pilot enabled", async () => {
    process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN = "https://myrank.com.tr";
    process.env.EXPO_PUBLIC_MP4_PROXY_ENABLED = "true";
    const { resolveVideoStreamUrl } = await import("./resolveMediaDisplayUrl");
    const url = resolveVideoStreamUrl(
      "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/posts%2Fu1%2F123_fast.mp4?alt=media"
    );
    expect(url).toContain("myrank.com.tr/fb-media");
  });

  it("resolveVideoStreamUrl keeps HLS direct even when MP4 pilot enabled", async () => {
    process.env.EXPO_PUBLIC_MP4_PROXY_ENABLED = "true";
    const { resolveVideoStreamUrl } = await import("./resolveMediaDisplayUrl");
    const url = resolveVideoStreamUrl(
      "https://firebasestorage.googleapis.com/v0/b/bucket/o/posts%2Fu1%2Fmaster.m3u8?alt=media"
    );
    expect(url).toContain("firebasestorage.googleapis.com");
    expect(url).not.toContain("fb-media");
  });
});
