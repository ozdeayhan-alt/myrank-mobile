import type { Post } from "../types";
import {
  collectVideoPostsForPlaylist,
  ensureVideoInPlaylist,
  filterVideoPosts,
  findVideoPostForOpen,
  indexOfVideoPost,
} from "./videoPosts";

function videoPost(id: string, authorId = "u1"): Post {
  return {
    id,
    authorId,
    postScore: 0,
    likeCount: 0,
    dislikeCount: 0,
    shareCount: 0,
    saveCount: 0,
    commentCount: 0,
    contentType: "video",
    content: "",
    mediaURL: "https://example.com/v.mp4",
  };
}

describe("indexOfVideoPost", () => {
  it("returns index when found", () => {
    const posts = [videoPost("a"), videoPost("b")];
    expect(indexOfVideoPost(posts, "b")).toBe(1);
  });

  it("returns -1 when missing", () => {
    expect(indexOfVideoPost([videoPost("a")], "missing")).toBe(-1);
  });
});

describe("ensureVideoInPlaylist", () => {
  it("prepends anchor when post id is not in playlist", () => {
    const anchor = videoPost("target");
    const playlist = [videoPost("other")];

    const result = ensureVideoInPlaylist("target", playlist, anchor);

    expect(result.map((post) => post.id)).toEqual(["target", "other"]);
  });

  it("keeps playlist when post already exists", () => {
    const playlist = [videoPost("target"), videoPost("other")];
    const anchor = videoPost("target");

    const result = ensureVideoInPlaylist("target", playlist, anchor);

    expect(result).toBe(playlist);
  });
});

describe("findVideoPostForOpen", () => {
  it("finds embedded original on repost cards", () => {
    const original = videoPost("orig", "author-2");
    const repost: Post = {
      id: "repost-1",
      authorId: "author-1",
      postScore: 0,
      likeCount: 0,
      dislikeCount: 0,
      shareCount: 0,
      saveCount: 0,
      commentCount: 0,
      contentType: "repost",
      content: "",
      originalPostId: original.id,
      originalSnapshot: {
        authorId: original.authorId,
        contentType: "video",
        mediaURL: original.mediaURL,
      },
    };

    expect(findVideoPostForOpen([repost], "orig")).toEqual(
      expect.objectContaining({ id: "orig" })
    );
  });
});

describe("filterVideoPosts", () => {
  it("includes HLS-only videos", () => {
    const hlsOnly: Post = {
      id: "hls",
      authorId: "u1",
      postScore: 0,
      likeCount: 0,
      dislikeCount: 0,
      shareCount: 0,
      saveCount: 0,
      commentCount: 0,
      contentType: "video",
      content: "",
      hlsURL: "https://example.com/v.m3u8",
    };

    expect(filterVideoPosts([hlsOnly]).map((post) => post.id)).toEqual(["hls"]);
  });

  it("excludes repost wrappers", () => {
    const posts: Post[] = [
      {
        id: "repost",
        authorId: "u1",
        postScore: 0,
        likeCount: 0,
        dislikeCount: 0,
        shareCount: 0,
        saveCount: 0,
        commentCount: 0,
        contentType: "repost",
        content: "",
        originalSnapshot: {
          authorId: "u2",
          contentType: "video",
          mediaURL: "https://example.com/v.mp4",
        },
      },
      videoPost("direct"),
    ];

    expect(filterVideoPosts(posts).map((post) => post.id)).toEqual(["direct"]);
  });
});

describe("collectVideoPostsForPlaylist", () => {
  it("includes embedded video from repost cards", () => {
    const posts: Post[] = [
      {
        id: "repost",
        authorId: "u1",
        postScore: 0,
        likeCount: 0,
        dislikeCount: 0,
        shareCount: 0,
        saveCount: 0,
        commentCount: 0,
        contentType: "repost",
        content: "",
        originalSnapshot: {
          authorId: "u2",
          contentType: "video",
          mediaURL: "https://example.com/v.mp4",
        },
        originalPostId: "orig",
      },
      videoPost("direct"),
    ];

    expect(collectVideoPostsForPlaylist(posts).map((post) => post.id)).toEqual([
      "orig",
      "direct",
    ]);
  });
});
