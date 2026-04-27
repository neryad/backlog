import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing } from "../constants/theme";
import { GameEntry } from "../types/game";
import { GAME_STATUS_THEMES, APP_NAME } from "../constants/shareCardThemes";

type Props = {
  entry: GameEntry;
  platformName?: string;
  appName?: string;
};

export function GameShareCard({
  entry,
  platformName,
  appName = APP_NAME,
}: Props) {
  const game = entry.game;
  const status = GAME_STATUS_THEMES[entry.status];
  const hours = Number.isFinite(entry.hoursPlayed) ? entry.hoursPlayed : 0;
  const rating = entry.personalRating ?? "-";

  if (!game) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: status.gradientBottom,
            borderColor: status.accent,
          },
        ]}
      >
        <View
          style={[
            styles.topGlow,
            {
              backgroundColor: status.gradientTop,
            },
          ]}
        />

        <View style={styles.headerRow}>
          <Text style={styles.appName}>{appName}</Text>
          <View style={[styles.statusPill, { borderColor: status.accent }]}>
            <Text style={[styles.statusText, { color: status.accent }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.emptyCardBody}>
          <Text style={styles.emptyCardTitle}>Game data unavailable</Text>
          <Text style={styles.emptyCardText}>
            Some game details are missing, but this entry is still ready to
            share.
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Hours</Text>
              <Text style={styles.statValue}>{hours}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statValue}>{rating}/10</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: status.gradientBottom,
          borderColor: status.accent,
        },
      ]}
    >
      <View
        style={[
          styles.topGlow,
          {
            backgroundColor: status.gradientTop,
          },
        ]}
      />
      <View style={[styles.orbLarge, { borderColor: status.accent }]} />
      <View style={[styles.orbSmall, { backgroundColor: status.accent }]} />

      <View style={styles.headerRow}>
        <Text style={styles.appName}>{appName}</Text>
        <View style={[styles.statusPill, { borderColor: status.accent }]}>
          <Text style={[styles.statusText, { color: status.accent }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        {game?.coverUrl ? (
          <Image
            source={{ uri: game.coverUrl }}
            style={styles.cover}
            contentFit="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText}>NO COVER</Text>
          </View>
        )}

        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={2}>
            {game?.title ?? "Unknown Game"}
          </Text>
          <Text style={styles.meta}>{platformName ?? "Unknown platform"}</Text>
          {game?.releaseYear ? (
            <Text style={styles.meta}>{game.releaseYear}</Text>
          ) : null}

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Hours</Text>
              <Text style={styles.statValue}>{hours}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statValue}>{rating}/10</Text>
            </View>
          </View>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.footerText}>
        {entry.notes?.trim()
          ? entry.notes
          : "Logged, rated, and ready to share."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 360,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    overflow: "hidden",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    opacity: 0.7,
  },
  orbLarge: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.25,
  },
  orbSmall: {
    position: "absolute",
    bottom: 72,
    right: 24,
    width: 10,
    height: 10,
    borderRadius: 999,
    opacity: 0.7,
  },
  headerRow: {
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  appName: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  contentRow: {
    zIndex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },
  cover: {
    width: 126,
    height: 168,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
  },
  coverPlaceholder: {
    width: 126,
    height: 168,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  coverPlaceholderText: {
    color: colors.foregroundMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  infoCol: {
    flex: 1,
    gap: spacing.xs,
  },
  emptyCardBody: {
    zIndex: 1,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emptyCardTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyCardText: {
    color: colors.foregroundMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  meta: {
    color: colors.foregroundMuted,
    fontSize: 13,
  },
  statsGrid: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  statLabel: {
    color: colors.foregroundMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  statValue: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    zIndex: 1,
    marginTop: spacing.md,
    color: colors.foreground,
    opacity: 0.9,
    fontSize: 13,
    lineHeight: 18,
  },
});
