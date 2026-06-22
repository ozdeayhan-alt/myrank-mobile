import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@myrank/seen-story-ids";
const MAX_ENTRIES = 500;

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

export async function getSeenStoryIds(): Promise<Set<string>> {
  return new Set(await readIds());
}

export async function markStorySeen(storyId: string): Promise<void> {
  if (!storyId.trim()) {
    return;
  }
  const ids = await readIds();
  if (ids.includes(storyId)) {
    return;
  }
  const next = [...ids, storyId].slice(-MAX_ENTRIES);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function markStoriesSeen(storyIds: string[]): Promise<void> {
  const unique = storyIds.filter(Boolean);
  if (unique.length === 0) {
    return;
  }
  const ids = await readIds();
  const merged = [...ids];
  for (const id of unique) {
    if (!merged.includes(id)) {
      merged.push(id);
    }
  }
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(merged.slice(-MAX_ENTRIES))
  );
}
