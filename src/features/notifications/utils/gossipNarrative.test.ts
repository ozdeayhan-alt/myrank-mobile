import {
  analyzeGossipNotifications,
  buildNarrativeHeadline,
  buildContextualOutro,
} from "./gossipNarrative";
import type { AppNotification } from "../types";

function notification(
  overrides: Partial<AppNotification> & Pick<AppNotification, "id" | "type">
): AppNotification {
  return {
    actorId: "actor-1",
    actorDisplayName: "Ayşe",
    payload: {},
    createdAt: null,
    ...overrides,
  };
}

describe("gossipNarrative", () => {
  it("detects popular but passed headline", () => {
    const notifications = [
      notification({ id: "l1", type: "post_liked", actorId: "a1" }),
      notification({ id: "l2", type: "post_liked", actorId: "a2" }),
      notification({ id: "l3", type: "post_liked", actorId: "a3" }),
      notification({
        id: "r1",
        type: "rank_passed",
        actorId: "a4",
        actorDisplayName: "Zeynep",
      }),
    ];
    const stats = analyzeGossipNotifications(notifications);
    const { headline } = buildNarrativeHeadline(
      notifications,
      stats,
      "Ayhancım",
      1
    );

    expect(headline).toMatch(/popüler|sollamış|sıra/i);
  });

  it("detects obsessed actor headline and excludes their events", () => {
    const notifications = [
      notification({
        id: "c1",
        type: "post_commented",
        actorId: "m1",
        actorDisplayName: "Mehmet",
      }),
      notification({
        id: "l1",
        type: "post_liked",
        actorId: "m1",
        actorDisplayName: "Mehmet",
      }),
    ];
    const stats = analyzeGossipNotifications(notifications);
    const { headline, excludedIds } = buildNarrativeHeadline(
      notifications,
      stats,
      "Ayhancım",
      2
    );

    expect(headline).toContain("Mehmet");
    expect(excludedIds.has("c1")).toBe(true);
    expect(excludedIds.has("l1")).toBe(true);
  });

  it("uses calm outro for few events", () => {
    const stats = analyzeGossipNotifications([
      notification({ id: "n1", type: "post_liked" }),
    ]);
    const outro = buildContextualOutro(stats, "Ayhancım", 3);
    expect(outro).toMatch(/Sakin|sakin|Rahat/i);
  });
});
