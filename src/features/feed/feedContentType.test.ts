import { toFeedApiContentType } from "./feedContentType";
import type { HomeFeedContentFilter } from "@/features/posts/store/useHomeFeedContentStore";

describe("toFeedApiContentType", () => {
  it("maps UI filters to API content types", () => {
    expect(toFeedApiContentType(null)).toBe("all");
    expect(toFeedApiContentType("tweet")).toBe("whisp");
    expect(toFeedApiContentType("image")).toBe("glow");
  });
});
