import { groupStoriesByUser } from "./groupStoriesByUser";
import type { AiStory } from "../constants/types";

function story(partial: Partial<AiStory> & { id: string; userId: string }): AiStory {
  return {
    authorDisplayName: "User",
    authorPhotoURL: null,
    moodKey: "peaceful",
    locationKey: "beach",
    actionKey: "walking",
    caption: null,
    sceneId: "default_cinematic",
    template: {
      sceneId: "default_cinematic",
      name: "Cinematic",
      type: "default",
      backgroundUrl: "https://example.com/v.mp4",
      overlays: [],
      colorGrade: "neutral",
      animationPreset: "slow_zoom",
    },
    status: "completed",
    sharedPostId: null,
    createdAt: 1000,
    expiresAt: 9999,
    ...partial,
  };
}

describe("groupStoriesByUser", () => {
  it("groups multiple stories per user chronologically", () => {
    const groups = groupStoriesByUser([
      story({ id: "b", userId: "u1", createdAt: 2000 }),
      story({ id: "a", userId: "u1", createdAt: 1000 }),
      story({ id: "c", userId: "u2", createdAt: 1500 }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.userId).toBe("u1");
    expect(groups[0]?.stories.map((item) => item.id)).toEqual(["a", "b"]);
  });
});
