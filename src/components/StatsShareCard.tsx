import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../constants/theme";
import { BacklogStats } from "../db/queries/stats";
import { STATS_STATUS_ORDER, APP_NAME } from "../constants/shareCardThemes";

type Props = {
  stats: BacklogStats;
};

export function StatsShareCard({ stats }: Props) {
  const segments = useMemo(
    () =>
      STATS_STATUS_ORDER.filter((item) => (stats.byStatus[item.key] ?? 0) > 0),
    [stats.byStatus],
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>{APP_NAME}</Text>
          <Text style={styles.title}>My Backlog Stats</Text>
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
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  percentBadge: {
    minWidth: 100,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  percentBadgeValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  percentBadgeLabel: {
    color: colors.textMuted,
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
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  statValue: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  breakdownCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  breakdownTitle: {
    color: colors.text,
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
    color: colors.text,
    fontSize: 13,
  },
  legendValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
