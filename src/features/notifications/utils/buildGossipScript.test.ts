import { buildGossipScript, buildGossipScriptParts } from "./buildGossipScript";
import { toDiminutive } from "./gossipPersonalization";
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

describe("buildGossipScript", () => {
  it("returns personalized empty gossip message", () => {
    expect(
      buildGossipScript([], { recipientDisplayName: "Ayhan Yılmaz" })
    ).toBe("Ayhancım, ortalık sessiz, bir şey paylaş da gıybet olsun.");
  });

  it("starts with personalized intro using first name diminutive", () => {
    const script = buildGossipScript(
      [notification({ id: "n1", type: "post_liked", actorDisplayName: "Mehmet" })],
      { recipientDisplayName: "Ayhan Yılmaz" }
    );

    expect(script).toMatch(
      /^Sen yokken neler oldu Ayhancım, dur sana anlatayım!/
    );
    expect(script).toContain("Mehmet");
    expect(script).not.toContain("son gönderini beğendi");
  });

  it("aggregates multiple likes into one gossip line", () => {
    const script = buildGossipScript(
      [
        notification({ id: "n1", type: "post_liked", actorDisplayName: "Ali" }),
        notification({ id: "n2", type: "post_liked", actorDisplayName: "Veli" }),
        notification({ id: "n3", type: "post_liked", actorDisplayName: "Can" }),
      ],
      { recipientDisplayName: "Ayhan" }
    );

    expect(script).toMatch(/3 (kişi|beğeni|kalp)/);
    expect(script).toContain("Ali");
    expect(script).toContain("Ayhancım");
  });

  it("returns chunked parts for paced speech", () => {
    const { parts } = buildGossipScriptParts(
      [notification({ id: "n1", type: "post_liked", actorDisplayName: "Mehmet" })],
      { recipientDisplayName: "Ayhan" }
    );

    expect(parts.length).toBeGreaterThanOrEqual(3);
    expect(parts[0]).toMatch(/^Sen yokken neler oldu Ayhancım/);
    expect(parts[parts.length - 1]).toContain("Ayhancım");
  });

  it("is deterministic for the same notification set", () => {
    const notifications = [
      notification({
        id: "n1",
        type: "rank_passed",
        actorDisplayName: "Zeynep",
        payload: { segmentLabel: "İzmir" },
      }),
      notification({
        id: "n2",
        type: "message_received",
        actorDisplayName: "Deniz",
      }),
    ];
    const options = { recipientDisplayName: "Mehmet Kaya" };

    expect(buildGossipScript(notifications, options)).toBe(
      buildGossipScript(notifications, options)
    );
  });
});

describe("toDiminutive", () => {
  it("uses cım suffix for back vowel names", () => {
    expect(toDiminutive("Ayhan Yılmaz")).toBe("Ayhancım");
  });

  it("uses cim suffix for front vowel names", () => {
    expect(toDiminutive("Mehmet Ali")).toBe("Mehmetcim");
  });
});
