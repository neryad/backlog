/**
 * Gaming Backlog — Typography Tokens
 * Stack: Inter (UI) + Space Grotesk (display) + JetBrains Mono (data)
 *
 * Install:
 *   npx expo install expo-font \
 *     @expo-google-fonts/inter \
 *     @expo-google-fonts/space-grotesk \
 *     @expo-google-fonts/jetbrains-mono
 */

export const fontFamily = {
  // UI general (listas, body, labels)
  sans:         "Inter_400Regular",
  sansMedium:   "Inter_500Medium",
  sansSemibold: "Inter_600SemiBold",
  sansBold:     "Inter_700Bold",

  // Display (títulos de juegos, hero, headers de sección)
  display:        "SpaceGrotesk_500Medium",
  displaySemibold:"SpaceGrotesk_600SemiBold",
  displayBold:    "SpaceGrotesk_700Bold",

  // Datos numéricos (horas jugadas, %, ratings, fechas)
  mono:       "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
  monoBold:   "JetBrainsMono_700Bold",
} as const;

export const fontSize = {
  xxs:  10,
  xs:   11,
  sm:   12,
  base: 14,
  md:   15,
  lg:   16,
  xl:   18,
  "2xl": 20,
  "3xl": 24,
  "4xl": 28,
  "5xl": 32,
  "6xl": 40,
} as const;

export const fontWeight = {
  regular:  "400",
  medium:   "500",
  semibold: "600",
  bold:     "700",
} as const;

export const lineHeight = {
  tight:   1.15,
  snug:    1.3,
  normal:  1.5,
  relaxed: 1.65,
} as const;

/** Compensación para fondos oscuros: sube ligeramente el tracking en textos pequeños */
export const letterSpacing = {
  tighter: -0.4,
  tight:   -0.2,
  normal:   0,
  wide:     0.2,
  wider:    0.4,
  widest:   1.2, // para uppercase / overlines
} as const;

/**
 * Text style presets — úsalos directamente con StyleSheet o como base.
 * Ejemplo:
 *   <Text style={textStyles.gameTitle}>Hollow Knight</Text>
 *   <Text style={textStyles.dataLg}>42.5h</Text>
 */
export const textStyles = {
  // Display / títulos grandes
  hero: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize["5xl"],
    lineHeight: fontSize["5xl"] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h1: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize["4xl"],
    lineHeight: fontSize["4xl"] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize["2xl"],
    lineHeight: fontSize["2xl"] * lineHeight.snug,
  },
  h3: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.snug,
  },

  // Títulos de juego en cards/listas
  gameTitle: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.snug,
  },
  gameTitleSm: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.snug,
  },

  // Body / UI
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodyMedium: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodySm: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.wide, // legibilidad en dark
  },

  // Labels / metadata
  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontFamily: fontFamily.sansBold,
    fontSize: fontSize.xxs,
    lineHeight: fontSize.xxs * lineHeight.normal,
    letterSpacing: letterSpacing.widest,
    textTransform: "uppercase" as const,
  },

  // Botones
  button: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.snug,
  },
  buttonSm: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.snug,
  },

  // DATOS (números): siempre mono para tabular alignment
  dataXl: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize["3xl"],
    lineHeight: fontSize["3xl"] * lineHeight.tight,
  },
  dataLg: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  data: {
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.tight,
  },
  dataSm: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
  },
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
};

export default typography;
