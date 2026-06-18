import type { Post } from "../types";
import { patchPostInList } from "./patchPostInCache";

describe("patchPostInCache", () => {
  const post: Post = {
    id: "p1",
    authorId: "a1",
    postScore: 0,
    likeCount: 0,
    dislikeCount: 0,
    shareCount: 0,
    saveCount: 0,
    commentCount: 0,
  };

  it("updates postScore and interaction counts together", () => {
    const next = patchPostInList([post], "p1", {
      postScore: 33,
      counts: {
        likeCount: 0,
        dislikeCount: 0,
        shareCount: 0,
        saveCount: 0,
        commentCount: 1,
      },
    });

    expect(next?.[0]).toMatchObject({
      postScore: 33,
      commentCount: 1,
    });
  });
});
