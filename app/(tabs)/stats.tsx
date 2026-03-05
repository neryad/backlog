import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getStats, BacklogStats } from "../../src/db/queries/stats";
import { colors, spacing, radius } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

// const STATUS_META: Record<
//   string,
//   { label: string; color: string; emoji: string }
// > = {
//   backlog: { label: "Backlog", color: colors.textMuted, emoji: "📋" },
//   playing: { label: "Playing", color: colors.primary, emoji: "🎮" },
//   completed: { label: "Completed", color: colors.success, emoji: "✅" },
//   dropped: { label: "Dropped", color: colors.danger, emoji: "❌" },
//   wishlist: { label: "Wishlist", color: colors.warning, emoji: "⭐" },
// };

const STATUS_META: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
  }
> = {
  backlog: { label: "Backlog", color: colors.textMuted, icon: "time-outline" },
  playing: {
    label: "Playing",
    color: colors.primary,
    icon: "game-controller-outline",
  },
  completed: {
    label: "Completed",
    color: colors.success,
    icon: "checkmark-circle-outline",
  },
  dropped: {
    label: "Dropped",
    color: colors.danger,
    icon: "close-circle-outline",
  },
  wishlist: { label: "Wishlist", color: colors.warning, icon: "star-outline" },
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${value}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export default function StatsScreen() {
  const [stats, setStats] = useState<BacklogStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      setStats(getStats());
    }, []),
  );

  if (!stats) return null;

  const totalForBar = Math.max(stats.total, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top stats */}
      <View style={styles.topCards}>
        <StatCard label="Total Games" value={String(stats.total)} />
        <StatCard
          label="Hours Played"
          value={
            stats.totalHours > 0 ? `${Math.round(stats.totalHours)}h` : "—"
          }
        />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating ? `${stats.avgRating}/10` : "—"}
        />
        <StatCard
          label="Completion"
          value={`${stats.completionRate}%`}
          sub={`${stats.byStatus["completed"] ?? 0} completed`}
        />
      </View>

      {/* By status */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Breakdown</Text>
        {Object.entries(STATUS_META).map(([key, meta]) => {
          const count = stats.byStatus[key] ?? 0;
          const percent = Math.round((count / totalForBar) * 100);
          if (count === 0) return null;

          return (
            <View key={key} style={styles.statusRow}>
              <View style={styles.statusHeader}>
                <Ionicons name={meta.icon} size={16} color={meta.color} />
                <Text style={styles.statusLabel}>{meta.label}</Text>
                <Text style={[styles.statusCount, { color: meta.color }]}>
                  {count}
                </Text>
                <Text style={styles.statusPercent}>{percent}%</Text>
              </View>
              <ProgressBar value={percent} color={meta.color} />
            </View>
          );
        })}
      </View>

      {/* Recently added */}
      {stats.recentlyAdded.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recently Added</Text>
          {stats.recentlyAdded.map((g, i) => (
            <View key={i} style={styles.recentRow}>
              <Text style={styles.recentTitle} numberOfLines={1}>
                {g.title}
              </Text>
              <Text style={styles.recentDate}>
                {new Date(Number(g.createdAt)).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  topCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  statusRow: {
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  statusLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  statusCount: {
    fontSize: 14,
    fontWeight: "700",
  },
  statusPercent: {
    color: colors.textMuted,
    fontSize: 12,
    width: 35,
    textAlign: "right",
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  recentDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
