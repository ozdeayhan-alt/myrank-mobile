import type { Post } from "../types";
import {
  filterPostsByContentType,
  resolvePostContentType,
} from "./filterPostsByContentType";

function post(overrides: Partial<Post> & Pick<Post, "id">): Post {
  return {
    authorId: "a1",
    postScore: 0,
    likeCount: 0,
    dislikeCount: 0,
    shareCount: 0,
    saveCount: 0,
    commentCount: 0,
    ...overrides,
  };
}

describe("filterPostsByContentType", () => {
  it("resolves repost content type from snapshot", () => {
    expect(
      resolvePostContentType(
        post({
          id: "1",
          contentType: "repost",
          originalSnapshot: { authorId: "a2", contentType: "video" },
        })
      )
    ).toBe("video");
  });

  it("filters tweets and images", () => {
    const posts = [
      post({ id: "t1", contentType: "tweet" }),
      post({ id: "i1", contentType: "image", mediaURL: "https://x/img.jpg" }),
      post({ id: "v1", contentType: "video", mediaURL: "https://x/v.mp4" }),
    ];

    expect(filterPostsByContentType(posts, "tweet").map((p) => p.id)).toEqual([
      "t1",
    ]);
    expect(filterPostsByContentType(posts, "image").map((p) => p.id)).toEqual([
      "i1",
    ]);
    expect(filterPostsByContentType(posts, null)).toHaveLength(3);
  });
});
