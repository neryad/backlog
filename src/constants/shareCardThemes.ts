import { GameStatus } from "../types/game";
import { colors } from "./theme";

export const APP_NAME = "Playlogged";

export const GAME_STATUS_THEMES: Record<
  GameStatus,
  { label: string; accent: string; gradientTop: string; gradientBottom: string }
> = {
  backlog: {
    label: "Backlog",
    accent: "#8b96ad",
    gradientTop: "#1f2a3d",
    gradientBottom: "#101521",
  },
  playing: {
    label: "Playing",
    accent: "#0bbf9f",
    gradientTop: "#12352f",
    gradientBottom: "#0d1e1b",
  },
  "playing-social": {
    label: "Playing Social",
    accent: "#2cc6ff",
    gradientTop: "#123245",
    gradientBottom: "#0d1b27",
  },
  completed: {
    label: "Completed",
    accent: "#4caf7d",
    gradientTop: "#193229",
    gradientBottom: "#0f1f18",
  },
  dropped: {
    label: "Dropped",
    accent: "#e05c5c",
    gradientTop: "#3b1f25",
    gradientBottom: "#211218",
  },
  wishlist: {
    label: "Wishlist",
    accent: "#f5a623",
    gradientTop: "#3a2b1a",
    gradientBottom: "#211911",
  },
};

export const STATS_STATUS_ORDER = [
  { key: "completed", label: "Completed", color: colors.success },
  { key: "playing", label: "Playing", color: colors.primary },
  { key: "backlog", label: "Backlog", color: colors.textMuted },
  { key: "wishlist", label: "Wishlist", color: colors.warning },
  { key: "dropped", label: "Dropped", color: colors.danger },
];
