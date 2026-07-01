import AsyncStorage from "@react-native-async-storage/async-storage";
import { ensureRankingEntries } from "./ensureRankingEntries";

const STORAGE_KEY = "@myrank/ensure-ranking-entries-at";
const MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

export async function ensureRankingEntriesIfNeeded(options?: {
  force?: boolean;
}): Promise<void> {
  if (options?.force) {
    await ensureRankingEntries({ profileSaved: true }).catch(() => undefined);
    await AsyncStorage.setItem(STORAGE_KEY, String(Date.now())).catch(
      () => undefined
    );
    return;
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const lastAt = raw ? Number(raw) : 0;
    if (Number.isFinite(lastAt) && Date.now() - lastAt < MIN_INTERVAL_MS) {
      return;
    }
    await ensureRankingEntries();
    await AsyncStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Sunucu kaydı kritik değil; sessizce geç.
  }
}
