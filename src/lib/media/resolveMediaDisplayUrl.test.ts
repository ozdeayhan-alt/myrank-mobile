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

  it("removes firebase download token", async () => {
    const { resolveMediaDisplayUrl } = await import("./resolveMediaDisplayUrl");
    expect(
      resolveMediaDisplayUrl(
        "https://firebasestorage.googleapis.com/v0/b/bucket/o/file.mp4?alt=media&token=abc"
      )
    ).toBe(
      "https://firebasestorage.googleapis.com/v0/b/bucket/o/file.mp4?alt=media"
    );
  });

  it("rewrites firebase storage URLs through media proxy when configured", async () => {
    process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN = "https://myrank.com.tr";
    const { resolveMediaDisplayUrl } = await import("./resolveMediaDisplayUrl");
    expect(
      resolveMediaDisplayUrl(
        "https://firebasestorage.googleapis.com/v0/b/bucket/o/video.mp4?alt=media"
      )
    ).toBe(
      "https://myrank.com.tr/fb-media/v0/b/bucket/o/video.mp4?alt=media"
    );
  });

  it("leaves non-firebase URLs unchanged", async () => {
    process.env.EXPO_PUBLIC_MEDIA_PROXY_ORIGIN = "https://myrank.com.tr";
    const { resolveMediaDisplayUrl } = await import("./resolveMediaDisplayUrl");
    expect(resolveMediaDisplayUrl("https://cdn.example.com/poster.jpg")).toBe(
      "https://cdn.example.com/poster.jpg"
    );
  });
});
