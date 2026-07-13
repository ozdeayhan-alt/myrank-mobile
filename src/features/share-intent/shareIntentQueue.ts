import AsyncStorage from "@react-native-async-storage/async-storage";
import { recordError } from "@/lib/crashReporting";
import type { ParsedSharePayload } from "./classifySharePayload";

const QUEUE_KEY = "@myrank/share-intent-queue";
const DEDUPE_KEY = "@myrank/share-intent-dedup";
const PENDING_KEY = "@myrank/share-intent-pending";
const DEDUPE_WINDOW_MS = 90_000;

type DedupeEntry = {
  key: string;
  at: number;
};

export type QueuedSharePayload = ParsedSharePayload & {
  queuedAt: number;
};

async function clearShareQueueStorage(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

function parseShareQueueJson(raw: string): QueuedSharePayload[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as QueuedSharePayload[]) : null;
  } catch (error) {
    recordError(error, "shareIntentQueue.parseShareQueueJson");
    return null;
  }
}

async function readDedupeEntries(): Promise<DedupeEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(DEDUPE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as DedupeEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeDedupeEntries(entries: DedupeEntry[]): Promise<void> {
  await AsyncStorage.setItem(DEDUPE_KEY, JSON.stringify(entries));
}

export async function wasRecentlyShared(dedupeKey: string): Promise<boolean> {
  const now = Date.now();
  const entries = (await readDedupeEntries()).filter(
    (entry) => now - entry.at < DEDUPE_WINDOW_MS
  );
  await writeDedupeEntries(entries);
  return entries.some((entry) => entry.key === dedupeKey);
}

export async function markShared(dedupeKey: string): Promise<void> {
  const now = Date.now();
  const entries = (await readDedupeEntries()).filter(
    (entry) => now - entry.at < DEDUPE_WINDOW_MS
  );
  entries.push({ key: dedupeKey, at: now });
  await AsyncStorage.setItem(DEDUPE_KEY, JSON.stringify(entries));
}

export async function enqueueSharePayload(
  payload: ParsedSharePayload
): Promise<void> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  let queue: QueuedSharePayload[] = [];
  if (raw) {
    const parsed = parseShareQueueJson(raw);
    if (parsed === null) {
      await clearShareQueueStorage();
    } else {
      queue = parsed;
    }
  }
  const next: QueuedSharePayload[] = [
    ...queue,
    { ...payload, queuedAt: Date.now() },
  ];
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next));
}

export async function readShareQueue(): Promise<QueuedSharePayload[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) {
    return [];
  }
  const parsed = parseShareQueueJson(raw);
  if (parsed === null) {
    await clearShareQueueStorage();
    return [];
  }
  return parsed;
}

export async function writeShareQueue(queue: QueuedSharePayload[]): Promise<void> {
  if (queue.length === 0) {
    await AsyncStorage.removeItem(QUEUE_KEY);
    return;
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function savePendingSharePayload(
  payload: ParsedSharePayload
): Promise<void> {
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(payload));
}

export async function consumePendingSharePayload(): Promise<ParsedSharePayload | null> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  if (!raw) {
    return null;
  }
  await AsyncStorage.removeItem(PENDING_KEY);
  try {
    return JSON.parse(raw) as ParsedSharePayload;
  } catch {
    return null;
  }
}

export async function peekPendingSharePayload(): Promise<ParsedSharePayload | null> {
  const raw = await AsyncStorage.getItem(PENDING_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as ParsedSharePayload;
  } catch {
    return null;
  }
}
