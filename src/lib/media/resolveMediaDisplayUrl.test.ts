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
        "https://firebasestorage.googleapis.com/v0/b/bucket/o/file.jpg?alt=media&token=abc"
      )
    ).toBe(
      "https://firebasestorage.googleapis.com/v0/b/bucket/o/file.jpg?alt=media"
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
});
