import { create } from "zustand";

export type ReelRowMode = "active" | "adjacent" | "idle";

type ReelsActiveIndexState = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  resetActiveIndex: () => void;
};

export function resolveReelRowMode(
  index: number,
  activeIndex: number
): ReelRowMode {
  const distance = Math.abs(index - activeIndex);
  if (distance === 0) {
    return "active";
  }
  if (distance === 1) {
    return "adjacent";
  }
  return "idle";
}

export const useReelsActiveIndexStore = create<ReelsActiveIndexState>(
  (set) => ({
    activeIndex: 0,
    setActiveIndex: (index) =>
      set((state) =>
        state.activeIndex === index ? state : { activeIndex: index }
      ),
    resetActiveIndex: () => set({ activeIndex: 0 }),
  })
);

export function useReelRowMode(index: number): ReelRowMode {
  return useReelsActiveIndexStore((state) =>
    resolveReelRowMode(index, state.activeIndex)
  );
}
