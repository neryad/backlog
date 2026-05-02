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
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
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
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "playlogged-ui-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        shareTemplate: state.shareTemplate,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
