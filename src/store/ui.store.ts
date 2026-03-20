import { create } from "zustand";
import { GameStatus } from "../types/game";

type UIStore = {
  activeFilter: GameStatus | "all";
  setFilter: (filter: GameStatus | "all") => void;
  pendingFriendRequests: number;
  setPendingFriendRequests: (count: number) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  activeFilter: "all",
  setFilter: (filter) => set({ activeFilter: filter }),
  pendingFriendRequests: 0,
  setPendingFriendRequests: (count) => set({ pendingFriendRequests: count }),
}));
