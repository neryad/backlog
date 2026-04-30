import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing } from "../constants/theme";
import { GameEntry } from "../types/game";
import {
  APP_NAME,
  BacklogShareTemplate,
  BACKLOG_TEMPLATE_PALETTE,
} from "../constants/shareCardThemes";

type Props = {
  entries: GameEntry[];
  totalGames: number;
  label?: string;
  template?: BacklogShareTemplate;
};

export function BacklogShareCard({
  entries,
  totalGames,
  label = "Top 3 Right Now",
  template = "neon",
}: Props) {
  const palette = BACKLOG_TEMPLATE_PALETTE[template];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.cardBg, borderColor: palette.border },
      ]}
    >
      <View style={[styles.glowTop, { backgroundColor: palette.glowTop }]} />
      <View
        style={[styles.glowBottom, { backgroundColor: palette.glowBottom }]}
      />

      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.kicker, { color: palette.kicker }]}>
            {APP_NAME}
          </Text>
          <Text style={styles.title}>{label}</Text>
        </View>
        <View
          style={[
            styles.totalBadge,
            {
              borderColor: palette.badgeBorder,
              backgroundColor: palette.badgeBg,
            },
          ]}
        >
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
            <View
              key={entry.id}
              style={[
                styles.row,
                {
                  backgroundColor: palette.rowBg,
                  borderColor: palette.rowBorder,
                },
              ]}
            >
              <View style={styles.rankCol}>
                <Text style={[styles.rankHash, { color: palette.rank }]}>
                  #{index + 1}
                </Text>
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
                  <Text
                    style={[styles.pill, { backgroundColor: palette.pillBg }]}
                  >
                    {rating}
                  </Text>
                  <Text
                    style={[styles.pill, { backgroundColor: palette.pillBg }]}
                  >
                    {hours}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.footer}>
        A quick snapshot of what is leading the backlog right now.
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
    borderWidth: 1,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -70,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  glowBottom: {
    position: "absolute",
    bottom: -80,
    left: -10,
    width: 240,
    height: 240,
    borderRadius: 999,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.foreground,
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
  },
  totalBadgeText: {
    color: colors.foreground,
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
    borderWidth: 1,
  },
  rankCol: {
    width: 36,
    alignItems: "center",
  },
  rankHash: {
    fontSize: 18,
    fontWeight: "800",
  },
  cover: {
    width: 54,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.cardElevated,
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
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  metaText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  pill: {
    color: colors.foreground,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  footer: {
    marginTop: spacing.lg,
    color: colors.foreground,
    opacity: 0.8,
    fontSize: 13,
  },
});
