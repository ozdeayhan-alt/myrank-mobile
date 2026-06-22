import type { Post } from "../types";
import { canSharePostToStory, resolvePostStoryMedia } from "./postStoryShare";

const basePost = {
  authorId: "author",
  authorDisplayName: "Author",
  postScore: 0,
  likeCount: 0,
  dislikeCount: 0,
  shareCount: 0,
  saveCount: 0,
  commentCount: 0,
} as const;

describe("postStoryShare", () => {
  it("allows image posts with media", () => {
    const post: Post = {
      ...basePost,
      id: "1",
      contentType: "image",
      mediaURL: "https://example.com/a.jpg",
    };
    expect(canSharePostToStory(post)).toBe(true);
    expect(resolvePostStoryMedia(post)?.mediaType).toBe("image");
  });

  it("allows video posts with media", () => {
    const post: Post = {
      ...basePost,
      id: "2",
      contentType: "video",
      mediaURL: "https://example.com/a.mp4",
      posterURL: "https://example.com/p.jpg",
    };
    expect(resolvePostStoryMedia(post)?.mediaType).toBe("video");
  });

  it("rejects tweet-only posts", () => {
    const post: Post = {
      ...basePost,
      id: "3",
      contentType: "tweet",
      content: "hello",
    };
    expect(canSharePostToStory(post)).toBe(false);
  });

  it("uses embedded media for reposts", () => {
    const post: Post = {
      ...basePost,
      id: "4",
      contentType: "repost",
      authorId: "me",
      originalPostId: "orig",
      originalSnapshot: {
        authorId: "other",
        authorDisplayName: "Other",
        contentType: "image",
        mediaURL: "https://example.com/b.jpg",
      },
    };
    expect(canSharePostToStory(post)).toBe(true);
  });
});
