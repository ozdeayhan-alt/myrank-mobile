import type { UserMetadata } from "@/features/profile/types";
import { create } from "zustand";
import type { FlowFeedVariant } from "../hooks/useFlowFeedInfinite";

export type FlowViewerSession = {
  variant: FlowFeedVariant;
  filters: UserMetadata | null;
  authorId: string | null;
};

type FlowViewerSessionStore = {
  session: FlowViewerSession | null;
  setSession: (session: FlowViewerSession) => void;
  clearSession: () => void;
};

export const useFlowViewerSessionStore = create<FlowViewerSessionStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
