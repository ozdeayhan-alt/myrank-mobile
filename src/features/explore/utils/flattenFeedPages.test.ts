import type { Post } from "@/features/posts/types";
import { flattenFeedPages } from "./flattenFeedPages";

function post(id: string): Post {
  return {
    id,
    authorId: "user-1",
    postScore: 0,
    likeCount: 0,
    dislikeCount: 0,
    shareCount: 0,
    saveCount: 0,
    commentCount: 0,
    createdAt: new Date("2026-01-01"),
    contentType: "tweet",
  };
}

describe("flattenFeedPages", () => {
  it("returns empty array for undefined data", () => {
    expect(flattenFeedPages(undefined)).toEqual([]);
  });

  it("flattens posts from all pages in order", () => {
    expect(
      flattenFeedPages({
        pages: [
          { posts: [post("a"), post("b")] },
          { posts: [post("c")] },
        ],
      })
    ).toEqual([post("a"), post("b"), post("c")]);
  });
});
