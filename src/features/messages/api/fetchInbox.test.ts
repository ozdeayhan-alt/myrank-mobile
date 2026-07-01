import { mapInboxDoc } from "./inboxMapping";

describe("mapInboxDoc", () => {
  it("maps inbox fields with defaults", () => {
    const entry = mapInboxDoc("conv1", {
      otherUserId: "u2",
      otherDisplayName: "Ada",
      lastMessageText: "Selam",
      unreadCount: 2,
    });

    expect(entry).toMatchObject({
      conversationId: "conv1",
      otherUserId: "u2",
      otherDisplayName: "Ada",
      lastMessageText: "Selam",
      unreadCount: 2,
      lastMessageAt: null,
    });
  });

  it("clamps negative unread counts to zero", () => {
    const entry = mapInboxDoc("conv1", { unreadCount: -3 });
    expect(entry.unreadCount).toBe(0);
  });
});
