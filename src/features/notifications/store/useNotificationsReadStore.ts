import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "@myrank/notificationsLastReadAt";

type NotificationsReadStore = {
  lastReadAt: Date | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markAsRead: () => Promise<void>;
};

export const useNotificationsReadStore = create<NotificationsReadStore>(
  (set) => ({
    lastReadAt: null,
    hydrated: false,
    hydrate: async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        set({
          lastReadAt: raw ? new Date(raw) : null,
          hydrated: true,
        });
      } catch {
        set({ hydrated: true });
      }
    },
    markAsRead: async () => {
      const now = new Date();
      set({ lastReadAt: now, hydrated: true });
      try {
        await AsyncStorage.setItem(STORAGE_KEY, now.toISOString());
      } catch {
        // Badge may briefly reappear on next launch; non-critical.
      }
    },
  })
);
