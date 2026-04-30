import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../constants/theme";
import { BacklogStats, MonthlyRecap } from "../db/queries/stats";
import { STATS_STATUS_ORDER, APP_NAME } from "../constants/shareCardThemes";

type Props = {
  stats: BacklogStats;
  monthlyRecap?: MonthlyRecap | null;
};

export function StatsShareCard({ stats, monthlyRecap }: Props) {
  const segments = useMemo(
    () =>
      STATS_STATUS_ORDER.filter((item) => (stats.byStatus[item.key] ?? 0) > 0),
    [stats.byStatus],
  );
  const topMonthlyGame = monthlyRecap?.topRatedThisMonth[0] ?? null;

  return (
    <View style={styles.card}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>{APP_NAME}</Text>
          <Text style={styles.title}>Backlog Snapshot</Text>
          <Text style={styles.subtitle}>
            Progress, playtime, and monthly momentum
          </Text>
        </View>
        <View style={styles.percentBadge}>
          <Text style={styles.percentBadgeValue}>{stats.completionRate}%</Text>
          <Text style={styles.percentBadgeLabel}>Completion</Text>
        </View>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Games tracked</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round(stats.totalHours)}h</Text>
          <Text style={styles.statLabel}>Playtime logged</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avgRating ?? "-"}</Text>
          <Text style={styles.statLabel}>Avg rating</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.byStatus.completed ?? 0}</Text>
          <Text style={styles.statLabel}>Games completed</Text>
        </View>
      </View>

      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>Breakdown</Text>
        <View style={styles.segmentBar}>
          {segments.map((segment) => {
            const count = stats.byStatus[segment.key] ?? 0;
            const flex = Math.max(count, 1);

            return (
              <View
                key={segment.key}
                style={[
                  styles.segment,
                  { backgroundColor: segment.color, flex },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.legendList}>
          {segments.map((segment) => (
            <View key={segment.key} style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: segment.color }]}
              />
              <Text style={styles.legendLabel}>{segment.label}</Text>
              <Text style={styles.legendValue}>
                {stats.byStatus[segment.key] ?? 0}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {monthlyRecap ? (
        <View style={styles.monthlyCard}>
          <View style={styles.monthlyHeaderRow}>
            <Text style={styles.monthlyTitle}>This Month</Text>
            <View style={styles.monthPill}>
              <Text style={styles.monthPillText}>
                {monthlyRecap.monthLabel}
              </Text>
            </View>
          </View>
          <View style={styles.monthlyStatsRow}>
            <View style={styles.monthlyStatBox}>
              <Text style={styles.monthlyStatValue}>
                {monthlyRecap.addedThisMonth}
              </Text>
              <Text style={styles.monthlyStatLabel}>Added</Text>
            </View>
            <View
              style={[styles.monthlyStatBox, styles.monthlyStatBoxFeatured]}
            >
              <Text style={styles.monthlyStatValue}>
                {monthlyRecap.completedThisMonth}
              </Text>
              <Text style={styles.monthlyStatLabel}>Completed</Text>
            </View>
          </View>

          {topMonthlyGame ? (
            <View style={styles.monthlyTopRow}>
              <Text style={styles.monthlyTopLabel}>Top pick</Text>
              <Text style={styles.monthlyTopText} numberOfLines={1}>
                {topMonthlyGame.title} ({topMonthlyGame.rating}/10)
              </Text>
            </View>
          ) : (
            <View style={styles.monthlyTopRow}>
              <Text style={styles.monthlyTopLabel}>Top pick</Text>
              <Text style={styles.monthlyTopText}>
                No rated games this month
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 420,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: "#17131f",
    borderWidth: 1,
    borderColor: "#3b3151",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: "rgba(124,106,247,0.14)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -110,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(76,175,125,0.12)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  kicker: {
    color: "#fca5a5",
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
  },
  subtitle: {
    color: "rgba(240,240,245,0.72)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
    maxWidth: 190,
  },
  percentBadge: {
    minWidth: 100,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  percentBadgeValue: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: "800",
  },
  percentBadgeLabel: {
    color: colors.foregroundMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    width: "48%",
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statValue: {
    color: colors.foreground,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },
  breakdownCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  breakdownTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  segmentBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
  },
  segment: {
    height: "100%",
  },
  legendList: {
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: spacing.sm,
  },
  legendLabel: {
    flex: 1,
    color: colors.foreground,
    fontSize: 13,
  },
  legendValue: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "700",
  },
  monthlyCard: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  monthlyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  monthlyTitle: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  monthPill: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  monthPillText: {
    color: colors.foregroundMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  monthlyStatsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  monthlyStatBox: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 3,
  },
  monthlyStatBoxFeatured: {
    borderColor: "rgba(76,175,125,0.3)",
    backgroundColor: "rgba(76,175,125,0.12)",
  },
  monthlyStatValue: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "800",
  },
  monthlyStatLabel: {
    color: colors.foregroundMuted,
    fontSize: 10,
    marginTop: 1,
  },
  monthlyTopText: {
    flex: 1,
    color: colors.foreground,
    fontSize: 11,
    lineHeight: 15,
  },
  monthlyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    paddingTop: spacing.sm,
  },
  monthlyTopLabel: {
    color: colors.foregroundMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
