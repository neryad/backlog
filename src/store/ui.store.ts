import { create } from "zustand";
import { GameStatus } from "../types/game";

type UIStore = {
  activeFilter: GameStatus | "all";
  setFilter: (filter: GameStatus | "all") => void;
};

export const useUIStore = create<UIStore>((set) => ({
  activeFilter: "all",
  setFilter: (filter) => set({ activeFilter: filter }),
}));
