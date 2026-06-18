import {
  feedImageMediaLayout,
  feedVideoMediaLayout,
} from "./mediaAspectRatio";

const WIDTH = 390;

describe("feedImageMediaLayout", () => {
  it("matches video poster box for portrait 9:16", () => {
    const imageLayout = feedImageMediaLayout(WIDTH, 9 / 16);
    const videoLayout = feedVideoMediaLayout(WIDTH, 9 / 16);
    expect(imageLayout).toEqual(videoLayout);
    expect(imageLayout.height).toBe(WIDTH * 1.25);
  });

  it("matches video poster box for square", () => {
    const imageLayout = feedImageMediaLayout(WIDTH, 1);
    const videoLayout = feedVideoMediaLayout(WIDTH, 1);
    expect(imageLayout).toEqual(videoLayout);
    expect(imageLayout.height).toBe(WIDTH);
  });

  it("matches video poster box for landscape 16:9", () => {
    const imageLayout = feedImageMediaLayout(WIDTH, 16 / 9);
    const videoLayout = feedVideoMediaLayout(WIDTH, 16 / 9);
    expect(imageLayout).toEqual(videoLayout);
  });

  it("compact mode respects max height override", () => {
    const layout = feedImageMediaLayout(WIDTH, 9 / 16, 160);
    expect(layout.height).toBe(160);
  });
});
