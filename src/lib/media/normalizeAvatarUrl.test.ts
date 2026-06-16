describe("normalizeAvatarUrl", () => {
  const legacyUrl =
    "https://firebasestorage.googleapis.com/v0/b/myrank-d62b9-storage/o/profiles%2Fu1%2Favatar.jpg?alt=media&token=abc";

  beforeEach(() => {
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET =
      "myrankapp-d62b9.firebasestorage.app";
  });

  it("rewrites legacy storage bucket URLs", async () => {
    const { normalizeAvatarUrl } = await import("./normalizeAvatarUrl");
    expect(normalizeAvatarUrl(legacyUrl)).toBe(
      "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/profiles%2Fu1%2Favatar.jpg?alt=media&token=abc"
    );
  });

  it("leaves current bucket URLs unchanged", async () => {
    const { normalizeAvatarUrl } = await import("./normalizeAvatarUrl");
    const current =
      "https://firebasestorage.googleapis.com/v0/b/myrankapp-d62b9.firebasestorage.app/o/profiles%2Fu1%2Favatar.jpg?alt=media&token=abc";
    expect(normalizeAvatarUrl(current)).toBe(current);
  });

  it("leaves external avatar URLs unchanged", async () => {
    const { normalizeAvatarUrl } = await import("./normalizeAvatarUrl");
    const external = "https://randomuser.me/api/portraits/men/11.jpg";
    expect(normalizeAvatarUrl(external)).toBe(external);
  });
});
