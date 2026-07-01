import AsyncStorage from "@react-native-async-storage/async-storage";

export type GaugeVoteMode = "up" | "down" | null;

const STORAGE_PREFIX = "gaugeVoteMode:v1";
const SAVE_DEBOUNCE_MS = 400;

const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export async function loadGaugeVoteMode(
  userId: string
): Promise<GaugeVoteMode> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (raw === "up" || raw === "down") {
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function saveGaugeVoteMode(
  userId: string,
  mode: "up" | "down"
): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), mode);
  } catch {
    // ignore
  }
}

export function saveGaugeVoteModeDebounced(
  userId: string,
  mode: "up" | "down"
): void {
  const key = storageKey(userId);
  const existing = pendingTimers.get(key);
  if (existing) {
    clearTimeout(existing);
  }
  pendingTimers.set(
    key,
    setTimeout(() => {
      pendingTimers.delete(key);
      void saveGaugeVoteMode(userId, mode);
    }, SAVE_DEBOUNCE_MS)
  );
}
