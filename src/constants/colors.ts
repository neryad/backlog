/**
 * Gaming Backlog — Color Tokens (Dark only)
 *
 * Paleta basada en tu theme original (violeta) + foregrounds + tokens semánticos.
 * Todos los valores en HEX para usar directo en RN StyleSheet.
 */

export const colors = {
  // Surfaces
  background:       "#0f0f13",
  backgroundElevated: "#16161f",
  card:             "#1a1a24",
  cardElevated:     "#24243a",
  popover:          "#1a1a24",

  // Text
  foreground:       "#f0f0f5",
  foregroundMuted:  "#8888aa",
  foregroundSubtle: "#5a5a72",

  // Brand
  primary:          "#7c6af7",
  primaryHover:     "#8d7cf8",
  primaryLight:     "#a89bf9",
  primaryForeground:"#ffffff",
  primarySoft:      "rgba(124, 106, 247, 0.15)", // para badges/backgrounds

  // Borders & inputs
  border:           "#2a2a40",
  borderSubtle:     "#1f1f30",
  input:            "#1a1a24",
  ring:             "#7c6af7",

  // Semantic
  success:           "#4caf7d",
  successForeground: "#ffffff",
  successSoft:       "rgba(76, 175, 125, 0.15)",

  warning:           "#f5a623",
  warningForeground: "#0f0f13",
  warningSoft:       "rgba(245, 166, 35, 0.15)",

  danger:            "#e05c5c",
  dangerForeground:  "#ffffff",
  dangerSoft:        "rgba(224, 92, 92, 0.15)",

  info:              "#5aa9f5",
  infoForeground:    "#ffffff",
  infoSoft:          "rgba(90, 169, 245, 0.15)",

  // Gaming-specific (status del backlog)
  statusPlaying:    "#4caf7d", // En progreso
  statusCompleted:  "#7c6af7", // Completado
  statusBacklog:    "#8888aa", // Pendiente
  statusDropped:    "#e05c5c", // Abandonado
  statusOnHold:     "#f5a623", // En pausa
  statusWishlist:   "#5aa9f5", // Wishlist

  // Rating (estrellas / score)
  rating:           "#f5c518", // amarillo IMDB-like
  ratingMuted:      "#3a3a4a",

  // Gaming-status extended
  statusPlayingSocial: "#14b8a6",

  // Gaming platform brand colors
  platformPSN:     "#0070D1",
  platformXbox:    "#107C10",
  platformSwitch:  "#E60012",
  platformSteam:   "#66C0F4",
  platformEpic:    "#c8c8c8",

  // Social / external brand
  socialTwitter:   "#1DA1F2",
  socialInstagram: "#E1306C",
  socialKofi:      "#FF5E5B",
  socialPaypal:    "#003087",

  // Surface micro-overlays (for icon wraps, dimmed rows, etc.)
  surfaceOverlayXs: "rgba(255,255,255,0.06)",
  surfaceOverlaySm: "rgba(255,255,255,0.12)",
  surfaceOverlayMd: "rgba(255,255,255,0.25)",

  // Overlays
  overlay:          "rgba(0, 0, 0, 0.6)",
  overlayLight:     "rgba(0, 0, 0, 0.3)",
} as const;

export type ColorToken = keyof typeof colors;
export default colors;