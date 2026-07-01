import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@myrank/seen-story-ids";
const MAX_ENTRIES = 500;
const FLUSH_DELAY_MS = 500;

let memorySeenIds: Set<string> | null = null;
let memoryLoadPromise: Promise<Set<string>> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let dirty = false;

async function readIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

async function ensureMemorySeenIds(): Promise<Set<string>> {
  if (memorySeenIds) {
    return memorySeenIds;
  }
  if (!memoryLoadPromise) {
    memoryLoadPromise = readIds().then((ids) => {
      memorySeenIds = new Set(ids);
      return memorySeenIds;
    });
  }
  return memoryLoadPromise;
}

function scheduleFlush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
  }
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushSeenIds();
  }, FLUSH_DELAY_MS);
}

async function flushSeenIds(): Promise<void> {
  if (!dirty || !memorySeenIds) {
    return;
  }
  dirty = false;
  const next = [...memorySeenIds].slice(-MAX_ENTRIES);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    dirty = true;
  }
}

export async function getSeenStoryIds(): Promise<Set<string>> {
  return new Set(await ensureMemorySeenIds());
}

export async function markStorySeen(storyId: string): Promise<void> {
  if (!storyId.trim()) {
    return;
  }
  const seen = await ensureMemorySeenIds();
  if (seen.has(storyId)) {
    return;
  }
  seen.add(storyId);
  dirty = true;
  scheduleFlush();
}

export async function markStoriesSeen(storyIds: string[]): Promise<void> {
  const unique = storyIds.filter(Boolean);
  if (unique.length === 0) {
    return;
  }
  const seen = await ensureMemorySeenIds();
  let changed = false;
  for (const id of unique) {
    if (!seen.has(id)) {
      seen.add(id);
      changed = true;
    }
  }
  if (!changed) {
    return;
  }
  dirty = true;
  scheduleFlush();
}

export function primeSeenStoryIds(ids: Iterable<string>): void {
  if (!memorySeenIds) {
    memorySeenIds = new Set(ids);
    memoryLoadPromise = Promise.resolve(memorySeenIds);
    return;
  }
  for (const id of ids) {
    memorySeenIds.add(id);
  }
}
