import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { fontFamily, fontSize } from "../../constants/typography";
import type { CommunityRankingRow } from "./useCommunityRanking";
import { RankBadge } from "./RankBadge";

type Props = {
  row: CommunityRankingRow;
  onPress: (igdbId: number) => void;
};

export function RankingListItem({ row, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => onPress(row.igdb_id)}
    >
      <Text style={styles.rank}>#{row.rank}</Text>

      {row.cover_url ? (
        <Image
          source={{ uri: row.cover_url }}
          style={styles.cover}
          contentFit="cover"
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons
            name="game-controller-outline"
            size={20}
            color={colors.foregroundMuted}
          />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {row.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="star" size={12} color={colors.rating} />
          <Text style={styles.rating}>
            {row.avg_rating.toFixed(1)}
          </Text>
          <Text style={styles.count}>({row.rating_count})</Text>
        </View>
      </View>

      <RankBadge change={row.change} size="sm" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rank: {
    width: 36,
    color: colors.foregroundMuted,
    fontFamily: fontFamily.monoBold,
    fontSize: fontSize.base,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  cover: {
    width: 44,
    height: 60,
    borderRadius: radius.sm,
  },
  coverPlaceholder: {
    width: 44,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.foreground,
    fontSize: fontSize.md,
    fontFamily: fontFamily.sansSemibold,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    color: colors.rating,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  count: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.mono,
    fontVariant: ["tabular-nums"],
  },
});
