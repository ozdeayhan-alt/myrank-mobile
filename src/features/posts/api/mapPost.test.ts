import { mapPostDoc } from "./mapPost";

describe("mapPostDoc", () => {
  it("maps core post fields with safe defaults", () => {
    expect(
      mapPostDoc("post-1", {
        authorId: "user-1",
        postScore: 12,
        likeCount: 3,
        contentType: "tweet",
        content: "selam",
      })
    ).toMatchObject({
      id: "post-1",
      authorId: "user-1",
      postScore: 12,
      likeCount: 3,
      content: "selam",
      saveCount: 0,
    });
  });

  it("maps repost snapshot fields", () => {
    const post = mapPostDoc("repost-1", {
      authorId: "user-1",
      contentType: "repost",
      originalSnapshot: {
        authorId: "orig-1",
        content: "orijinal",
      },
    });

    expect(post.originalSnapshot).toEqual({
      authorId: "orig-1",
      content: "orijinal",
    });
  });
});
