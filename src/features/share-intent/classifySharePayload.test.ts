import {
  classifyShareTarget,
  buildWhispContent,
  type ParsedSharePayload,
} from "./classifySharePayload";

describe("classifyShareTarget", () => {
  const base: ParsedSharePayload = {
    dedupeKey: "x",
    text: "",
    url: null,
    localImagePath: null,
    localImageMime: null,
    metaTitle: null,
  };

  it("routes youtube to flow", () => {
    expect(
      classifyShareTarget({
        ...base,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      })
    ).toBe("flow");
  });

  it("routes tiktok to flow", () => {
    expect(
      classifyShareTarget({
        ...base,
        url: "https://www.tiktok.com/@user/video/1234567890",
      })
    ).toBe("flow");
  });

  it("routes instagram link to whisp", () => {
    expect(
      classifyShareTarget({
        ...base,
        url: "https://www.instagram.com/p/ABC123xyz/",
      })
    ).toBe("tweet");
  });

  it("routes pinterest link to whisp", () => {
    expect(
      classifyShareTarget({
        ...base,
        url: "https://www.pinterest.com/pin/123/",
      })
    ).toBe("tweet");
  });

  it("routes local image file to glow", () => {
    expect(
      classifyShareTarget({
        ...base,
        localImagePath: "file:///tmp/photo.jpg",
      })
    ).toBe("image");
  });

  it("routes generic web to whisp", () => {
    expect(
      classifyShareTarget({
        ...base,
        url: "https://example.com/haber",
      })
    ).toBe("tweet");
  });

  it("builds whisp fallback content from url host", () => {
    const content = buildWhispContent({
      ...base,
      url: "https://www.example.com/haber",
    });
    expect(content).toContain("example.com");
  });
});
