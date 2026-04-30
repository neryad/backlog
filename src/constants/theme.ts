// export const colors = {
//   background:   '#0f0f13',
//   surface:      '#1a1a24',
//   surfaceHigh:  '#24243a',
//   primary:      '#7c6af7',
//   primaryLight: '#a89bf9',
//   text:         '#f0f0f5',
//   textMuted:    '#8888aa',
//   success:      '#4caf7d',
//   warning:      '#f5a623',
//   danger:       '#e05c5c',
//   border:       '#2a2a40',
// };

// export const spacing = {
//   xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
// };

// export const radius = {
//   sm: 6, md: 12, lg: 20,
// };

// export const fontSize = {
//   xs:   11,
//   sm:   12,
//   md:   14,
//   base: 15,
//   lg:   16,
//   xl:   18,
//   '2xl': 20,
//   '3xl': 22,
//   '4xl': 24,
//   '5xl': 28,
// };

/**
 * Gaming Backlog — Theme index
 * Punto único de entrada. Importa todo desde aquí:
 *   import { theme } from "./theme";
 *   <Text style={{ color: theme.colors.foreground, ...theme.typography.textStyles.gameTitle }}>
 */

import colors from "./colors";
import typography from "./typography";

export { colors } from "./colors";

export const spacing = {
  0: 0,
  px: 1,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const opacity = {
  disabled: 0.4,
  pressed:  0.75,
  overlay:  0.6,
  hover:    0.9,
} as const;

export const duration = {
  instant: 100,
  fast:    150,
  normal:  250,
  slow:    400,
} as const;

export const zIndex = {
  base:     0,
  dropdown: 10,
  sticky:   20,
  modal:    50,
  toast:    100,
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  opacity,
  duration,
  zIndex,
};

export type Theme = typeof theme;
export default theme;