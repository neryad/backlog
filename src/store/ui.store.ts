import { create } from "zustand";
import { GameStatus } from "../types/game";

export type SortOption = "recently-added" | "title-az";

type UIStore = {
  activeFilter: GameStatus | "all";
  sortBy: SortOption;
  setFilter: (filter: GameStatus | "all") => void;
  setSortBy: (sortBy: SortOption) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  activeFilter: "all",
  sortBy: "recently-added",
  setFilter: (filter) => set({ activeFilter: filter }),
  setSortBy: (sortBy) => set({ sortBy }),
}));
