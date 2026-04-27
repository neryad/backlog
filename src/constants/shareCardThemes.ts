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
  { key: "backlog", label: "Backlog", color: colors.foregroundMuted },
  { key: "wishlist", label: "Wishlist", color: colors.warning },
  { key: "dropped", label: "Dropped", color: colors.danger },
];

export type BacklogShareTemplate = "minimal" | "neon" | "retro";

export const BACKLOG_SHARE_TEMPLATES: {
  value: BacklogShareTemplate;
  label: string;
}[] = [
  { value: "minimal", label: "Minimal" },
  { value: "neon", label: "Neon" },
  { value: "retro", label: "Retro" },
];

export const BACKLOG_TEMPLATE_PALETTE: Record<
  BacklogShareTemplate,
  {
    cardBg: string;
    border: string;
    kicker: string;
    glowTop: string;
    glowBottom: string;
    badgeBorder: string;
    badgeBg: string;
    rowBg: string;
    rowBorder: string;
    rank: string;
    pillBg: string;
  }
> = {
  minimal: {
    cardBg: "#181a22",
    border: "#2a2d38",
    kicker: "#c0cad9",
    glowTop: "rgba(160, 174, 196, 0.14)",
    glowBottom: "rgba(100, 116, 139, 0.12)",
    badgeBorder: "rgba(192, 202, 217, 0.3)",
    badgeBg: "rgba(255,255,255,0.04)",
    rowBg: "rgba(255,255,255,0.04)",
    rowBorder: "rgba(255,255,255,0.07)",
    rank: "#c0cad9",
    pillBg: "rgba(255,255,255,0.08)",
  },
  neon: {
    cardBg: "#121721",
    border: "#2d3a52",
    kicker: "#7dd3fc",
    glowTop: "rgba(56, 189, 248, 0.16)",
    glowBottom: "rgba(124, 106, 247, 0.18)",
    badgeBorder: "rgba(125, 211, 252, 0.35)",
    badgeBg: "rgba(255,255,255,0.05)",
    rowBg: "rgba(255,255,255,0.05)",
    rowBorder: "rgba(255,255,255,0.08)",
    rank: "#7dd3fc",
    pillBg: "rgba(0,0,0,0.22)",
  },
  retro: {
    cardBg: "#211712",
    border: "#5c3a2a",
    kicker: "#fbbf24",
    glowTop: "rgba(245, 158, 11, 0.16)",
    glowBottom: "rgba(239, 68, 68, 0.12)",
    badgeBorder: "rgba(251, 191, 36, 0.35)",
    badgeBg: "rgba(251, 191, 36, 0.1)",
    rowBg: "rgba(251, 191, 36, 0.08)",
    rowBorder: "rgba(251, 191, 36, 0.25)",
    rank: "#fbbf24",
    pillBg: "rgba(0,0,0,0.3)",
  },
};
