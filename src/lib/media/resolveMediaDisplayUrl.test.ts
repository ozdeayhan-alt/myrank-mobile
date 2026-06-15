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
});
