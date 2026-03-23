import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing } from "../constants/theme";
import { GameEntry } from "../types/game";
import { APP_NAME } from "../constants/shareCardThemes";

type Props = {
  entries: GameEntry[];
  totalGames: number;
  label?: string;
};

export function BacklogShareCard({
  entries,
  totalGames,
  label = "Top 3 Right Now",
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>{APP_NAME}</Text>
          <Text style={styles.title}>{label}</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{totalGames} tracked</Text>
        </View>
      </View>

      <View style={styles.list}>
        {entries.map((entry, index) => {
          const title = entry.game?.title ?? "Unknown Game";
          const rating = entry.personalRating
            ? `${entry.personalRating}/10`
            : "-";
          const hours =
            Number.isFinite(entry.hoursPlayed) && entry.hoursPlayed > 0
              ? `${entry.hoursPlayed}h`
              : "No hours";
          const platform =
            entry.platform?.shortName ?? entry.platform?.name ?? "Platform";

          return (
            <View key={entry.id} style={styles.row}>
              <View style={styles.rankCol}>
                <Text style={styles.rankHash}>#{index + 1}</Text>
              </View>

              {entry.game?.coverUrl ? (
                <Image
                  source={{ uri: entry.game.coverUrl }}
                  style={styles.cover}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}

              <View style={styles.infoCol}>
                <Text numberOfLines={1} style={styles.gameTitle}>
                  {title}
                </Text>
                <Text numberOfLines={1} style={styles.metaText}>
                  {platform}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.pill}>{rating}</Text>
                  <Text style={styles.pill}>{hours}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.footer}>
        Share your current picks and compare backlogs.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 420,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: "#121721",
    borderWidth: 1,
    borderColor: "#2d3a52",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -70,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(56, 189, 248, 0.16)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -80,
    left: -10,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(124, 106, 247, 0.18)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  kicker: {
    color: "#7dd3fc",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    maxWidth: 220,
  },
  totalBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.35)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  totalBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  rankCol: {
    width: 36,
    alignItems: "center",
  },
  rankHash: {
    color: "#7dd3fc",
    fontSize: 18,
    fontWeight: "800",
  },
  cover: {
    width: 54,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
  },
  coverPlaceholder: {
    width: 54,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  infoCol: {
    flex: 1,
  },
  gameTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  pill: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  footer: {
    marginTop: spacing.lg,
    color: colors.text,
    opacity: 0.8,
    fontSize: 13,
  },
});
