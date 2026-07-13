/** External vote display — optimistic score updates without re-rendering feed cells. */

type VoteDisplayEntry = {
  serverScore: number;
  pending: number;
  version: number;
};

const entries = new Map<string, VoteDisplayEntry>();
const listeners = new Map<string, Set<() => void>>();

export function postVoteDisplayKey(postId: string): string {
  return `post:${postId}`;
}

export function profileVoteDisplayKey(userId: string): string {
  return `profile:${userId}`;
}

function getOrCreateEntry(key: string, serverScore: number): VoteDisplayEntry {
  const existing = entries.get(key);
  if (existing) {
    return existing;
  }

  const created: VoteDisplayEntry = {
    serverScore,
    pending: 0,
    version: 0,
  };
  entries.set(key, created);
  return created;
}

function publish(key: string): void {
  const entry = entries.get(key);
  if (entry) {
    entry.version += 1;
  }
  listeners.get(key)?.forEach((listener) => listener());
}

export function initVoteDisplay(key: string, serverScore: number): void {
  const entry = getOrCreateEntry(key, serverScore);
  if (entry.pending === 0) {
    entry.serverScore = serverScore;
    publish(key);
  }
}

export function syncVoteDisplay(
  key: string,
  serverScore: number,
  pending: number
): void {
  const entry = getOrCreateEntry(key, serverScore);
  entry.serverScore = serverScore;
  entry.pending = pending;
  publish(key);
}

export function resetVoteDisplay(key: string, serverScore: number): void {
  const entry = getOrCreateEntry(key, serverScore);
  entry.serverScore = serverScore;
  entry.pending = 0;
  publish(key);
}

export function getVoteDisplayScore(key: string): number {
  const entry = entries.get(key);
  if (!entry) {
    return 0;
  }
  return entry.serverScore + entry.pending;
}

export function getVoteDisplayVersion(key: string): number {
  return entries.get(key)?.version ?? 0;
}

export function subscribeVoteDisplay(
  key: string,
  listener: () => void
): () => void {
  let keyListeners = listeners.get(key);
  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }
  keyListeners.add(listener);
  return () => {
    keyListeners?.delete(listener);
    if (keyListeners && keyListeners.size === 0) {
      listeners.delete(key);
    }
  };
}
