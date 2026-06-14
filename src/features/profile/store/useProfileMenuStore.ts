import { create } from "zustand";

type ProfileMenuStore = {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  editHandler: (() => void) | null;
  setEditHandler: (handler: (() => void) | null) => void;
};

export const useProfileMenuStore = create<ProfileMenuStore>((set) => ({
  menuOpen: false,
  openMenu: () => set({ menuOpen: true }),
  closeMenu: () => set({ menuOpen: false }),
  editHandler: null,
  setEditHandler: (editHandler) => set({ editHandler }),
}));
