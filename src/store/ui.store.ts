import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameStatus } from "../types/game";
import { BacklogShareTemplate } from "../constants/shareCardThemes";

export type SortOption = "recently-added" | "title-az" | "top-rated" | "most-played";

type UIStore = {
  activeFilter: GameStatus | "all";
  sortBy: SortOption;
  shareTemplate: BacklogShareTemplate;
  setFilter: (filter: GameStatus | "all") => void;
  setSortBy: (sortBy: SortOption) => void;
  setShareTemplate: (template: BacklogShareTemplate) => void;
  pendingFriendRequests: number;
  setPendingFriendRequests: (count: number) => void;
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      activeFilter: "all",
      sortBy: "recently-added",
      shareTemplate: "neon",
      setFilter: (filter) => set({ activeFilter: filter }),
      setSortBy: (sortBy) => set({ sortBy }),
      setShareTemplate: (shareTemplate) => set({ shareTemplate }),
      pendingFriendRequests: 0,
      setPendingFriendRequests: (count) => set({ pendingFriendRequests: count }),
    }),
    {
      name: "playlogged-ui-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ shareTemplate: state.shareTemplate }),
    },
  ),
);
