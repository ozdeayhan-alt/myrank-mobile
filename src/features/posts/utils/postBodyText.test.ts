import { postBodyText } from "./postBodyText";

describe("postBodyText", () => {
  it("returns trimmed tweet content", () => {
    expect(
      postBodyText({
        id: "1",
        authorId: "u1",
        postScore: 0,
        likeCount: 0,
        dislikeCount: 0,
        shareCount: 0,
        saveCount: 0,
        commentCount: 0,
        contentType: "tweet",
        content: "  merhaba  ",
      })
    ).toBe("merhaba");
  });

  it("returns repost caption when present", () => {
    expect(
      postBodyText({
        id: "1",
        authorId: "u1",
        postScore: 0,
        likeCount: 0,
        dislikeCount: 0,
        shareCount: 0,
        saveCount: 0,
        commentCount: 0,
        contentType: "repost",
        repostCaption: " paylaşım ",
      })
    ).toBe("paylaşım");
  });

  it("returns null for media-only posts without text", () => {
    expect(
      postBodyText({
        id: "1",
        authorId: "u1",
        postScore: 0,
        likeCount: 0,
        dislikeCount: 0,
        shareCount: 0,
        saveCount: 0,
        commentCount: 0,
        contentType: "image",
        mediaURL: "https://example.com/a.jpg",
      })
    ).toBeNull();
  });
});
