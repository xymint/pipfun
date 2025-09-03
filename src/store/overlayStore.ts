import { create } from "zustand";

export type BackgroundLayer = "LIGHT" | "MODAL" | "DARK";

type OverlayState = {
  // unified UI store
  backgroundLayer: BackgroundLayer;
  version: number;

  setLight: () => void;
  setModal: () => void;
  setDark: () => void;
  resetOverlays: () => void; // also bumps version for portals
};

export const useOverlayStore = create<OverlayState>((set, get) => ({
  backgroundLayer: "LIGHT",
  version: 0,

  setLight: () => set({ backgroundLayer: "LIGHT" }),
  setModal: () => set({ backgroundLayer: "MODAL" }),
  setDark: () => set({ backgroundLayer: "DARK" }),
  resetOverlays: () => set({ backgroundLayer: "LIGHT", version: get().version + 1 }),
}));
