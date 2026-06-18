import { flushVoteDeltaInChunks } from "./flushVoteDeltaInChunks";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("flushVoteDeltaInChunks", () => {
  it("sends 500 delta as three sequential requests", async () => {
    const sent: number[] = [];
    await flushVoteDeltaInChunks(500, async (chunk) => {
      sent.push(chunk);
      return chunk;
    });
    expect(sent).toEqual([200, 200, 100]);
  });

  it("sends 2000 delta as ten sequential requests", async () => {
    const sent: number[] = [];
    await flushVoteDeltaInChunks(2000, async (chunk) => {
      sent.push(chunk);
      return chunk;
    });
    expect(sent).toEqual(Array(10).fill(200));
  });

  it("waits for each chunk under simulated latency", async () => {
    const order: string[] = [];
    await flushVoteDeltaInChunks(350, async (chunk) => {
      order.push(`start:${chunk}`);
      await delay(5);
      order.push(`end:${chunk}`);
      return chunk;
    });
    expect(order).toEqual([
      "start:200",
      "end:200",
      "start:150",
      "end:150",
    ]);
  });

  it("stops after first failing chunk (offline mid-flush)", async () => {
    const sent: number[] = [];
    await expect(
      flushVoteDeltaInChunks(500, async (chunk) => {
        sent.push(chunk);
        if (sent.length === 2) {
          throw new Error("network offline");
        }
        return chunk;
      })
    ).rejects.toThrow("network offline");
    expect(sent).toEqual([200, 200]);
  });

  it("resumes remaining delta after simulated reconnect", async () => {
    let pending = 500;
    const sent: number[] = [];
    let failNextFlush = true;

    const flushPending = async () => {
      await flushVoteDeltaInChunks(pending, async (chunk) => {
        sent.push(chunk);
        if (failNextFlush && sent.length === 2) {
          throw new Error("network offline");
        }
        pending -= chunk;
        return chunk;
      });
    };

    try {
      await flushPending();
    } catch {
      // offline after first chunk applied
    }

    expect(sent).toEqual([200, 200]);
    expect(pending).toBe(300);

    failNextFlush = false;
    await flushPending();
    expect(sent).toEqual([200, 200, 200, 100]);
    expect(pending).toBe(0);
  });

  it("returns null for zero delta", async () => {
    const send = jest.fn();
    expect(await flushVoteDeltaInChunks(0, send)).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });
});
