import { create } from "zustand";
import type { Post } from "../types";

type FeedInteractionStore = {
  post: Post | null;
  shareSheetOpen: boolean;
  repostOpen: boolean;
  ownerMenuOpen: boolean;
  moreMenuOpen: boolean;
  deleteConfirmOpen: boolean;
  reportMenuOpen: boolean;
  editOpen: boolean;
  openShare: (post: Post) => void;
  openOwnerMenu: (post: Post) => void;
  openMoreMenu: (post: Post) => void;
  setShareSheetOpen: (open: boolean) => void;
  setRepostOpen: (open: boolean) => void;
  setOwnerMenuOpen: (open: boolean) => void;
  setMoreMenuOpen: (open: boolean) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
  setReportMenuOpen: (open: boolean) => void;
  setEditOpen: (open: boolean) => void;
  clearPost: () => void;
};

export const useFeedInteractionStore = create<FeedInteractionStore>((set) => ({
  post: null,
  shareSheetOpen: false,
  repostOpen: false,
  ownerMenuOpen: false,
  moreMenuOpen: false,
  deleteConfirmOpen: false,
  reportMenuOpen: false,
  editOpen: false,
  openShare: (post) =>
    set({
      post,
      shareSheetOpen: true,
      repostOpen: false,
      ownerMenuOpen: false,
      moreMenuOpen: false,
      deleteConfirmOpen: false,
      reportMenuOpen: false,
      editOpen: false,
    }),
  openOwnerMenu: (post) =>
    set({
      post,
      ownerMenuOpen: true,
      moreMenuOpen: false,
      shareSheetOpen: false,
      repostOpen: false,
    }),
  openMoreMenu: (post) =>
    set({
      post,
      moreMenuOpen: true,
      ownerMenuOpen: false,
      shareSheetOpen: false,
      repostOpen: false,
    }),
  setShareSheetOpen: (shareSheetOpen) => set({ shareSheetOpen }),
  setRepostOpen: (repostOpen) => set({ repostOpen }),
  setOwnerMenuOpen: (ownerMenuOpen) => set({ ownerMenuOpen }),
  setMoreMenuOpen: (moreMenuOpen) => set({ moreMenuOpen }),
  setDeleteConfirmOpen: (deleteConfirmOpen) => set({ deleteConfirmOpen }),
  setReportMenuOpen: (reportMenuOpen) => set({ reportMenuOpen }),
  setEditOpen: (editOpen) => set({ editOpen }),
  clearPost: () =>
    set({
      post: null,
      shareSheetOpen: false,
      repostOpen: false,
      ownerMenuOpen: false,
      moreMenuOpen: false,
      deleteConfirmOpen: false,
      reportMenuOpen: false,
      editOpen: false,
    }),
}));
