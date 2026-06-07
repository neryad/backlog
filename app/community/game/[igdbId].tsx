import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../../src/constants/theme";
import { fontFamily, fontSize } from "../../../src/constants/typography";
import {
  useCommunityGameDetail,
  type CommunityReview,
} from "../../../src/features/top/useCommunityGameDetail";
import { RankBadge } from "../../../src/features/top/RankBadge";
import { Avatar } from "../../../src/components/Avatar";

type SortMode = "recent" | "highest";

function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export default function CommunityGameScreen() {
  const { igdbId } = useLocalSearchParams<{ igdbId: string }>();
  const router = useRouter();
  const id = Number(igdbId);
  const { data, isLoading, isError, refetch, isRefetching } =
    useCommunityGameDetail(id);

  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const sortedReviews = useMemo(() => {
    if (!data?.reviews) return [];
    const list = [...data.reviews];
    if (sortMode === "recent") {
      list.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    } else {
      list.sort((a, b) => b.personal_rating - a.personal_rating);
    }
    return list;
  }, [data?.reviews, sortMode]);

  const renderReview = useCallback(
    ({ item }: { item: CommunityReview }) => (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <TouchableOpacity
            style={styles.reviewUser}
            activeOpacity={0.7}
            onPress={() => router.push(`/profile/${item.username}`)}
          >
            <Avatar
              avatarUrl={item.avatar_url}
              username={item.username}
              displayName={item.display_name}
              size={36}
            />
            <View>
              <Text style={styles.reviewUsername}>@{item.username}</Text>
              {item.display_name && (
                <Text style={styles.reviewDisplayName}>
                  {item.display_name}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.reviewRating}>
            <Ionicons name="star" size={14} color={colors.rating} />
            <Text style={styles.reviewRatingText}>
              {item.personal_rating}
            </Text>
          </View>
        </View>
        <Text style={styles.reviewNotes}>{item.notes}</Text>
        <Text style={styles.reviewDate}>
          {formatRelativeDate(item.updated_at)}
        </Text>
      </View>
    ),
    [router],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !data || !data.game) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.foregroundMuted}
        />
        <Text style={styles.errorTitle}>Could not load game</Text>
      </View>
    );
  }

  const { game, ranking, change } = data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Stack.Screen options={{ title: game.title }} />

      <View style={styles.headerCard}>
        <View style={styles.heroRow}>
          {game.cover_url ? (
            <Image
              source={{ uri: game.cover_url }}
              style={styles.cover}
              contentFit="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons
                name="game-controller-outline"
                size={32}
                color={colors.foregroundMuted}
              />
            </View>
          )}
          <View style={styles.heroInfo}>
            <Text style={styles.title} numberOfLines={3}>
              {game.title}
            </Text>
            {ranking && (
              <View style={styles.statsRow}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={18} color={colors.rating} />
                  <Text style={styles.ratingText}>
                    {ranking.avg_rating.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.ratingCount}>
                  ({ranking.rating_count} ratings)
                </Text>
              </View>
            )}
          </View>
        </View>

        {ranking && (
          <View style={styles.rankRow}>
            <Text style={styles.rankLabel}>Current rank</Text>
            <Text style={styles.rankNumber}>#{ranking.rank}</Text>
            <RankBadge change={change} />
          </View>
        )}
      </View>

      {sortedReviews.length > 0 && (
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortMode === "recent" && styles.sortBtnActive,
            ]}
            onPress={() => setSortMode("recent")}
          >
            <Text
              style={[
                styles.sortText,
                sortMode === "recent" && styles.sortTextActive,
              ]}
            >
              Most recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortBtn,
              sortMode === "highest" && styles.sortBtnActive,
            ]}
            onPress={() => setSortMode("highest")}
          >
            <Text
              style={[
                styles.sortText,
                sortMode === "highest" && styles.sortTextActive,
              ]}
            >
              Highest rated
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {sortedReviews.length > 0 ? (
        sortedReviews.map((review) => (
          <View key={`${review.user_id}-${review.updated_at}`}>
            {renderReview({ item: review })}
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Ionicons
            name="chatbubbles-outline"
            size={40}
            color={colors.foregroundMuted}
          />
          <Text style={styles.emptyTitle}>No written reviews yet</Text>
          <Text style={styles.emptySub}>
            Be the first to share your thoughts on this game.
          </Text>
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
    paddingBottom: spacing.xl * 2,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
  },
  headerCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  heroRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cover: {
    width: 90,
    height: 130,
    borderRadius: radius.md,
  },
  coverPlaceholder: {
    width: 90,
    height: 130,
    borderRadius: radius.md,
    backgroundColor: colors.cardElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.foreground,
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize["2xl"],
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.rating + "22",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  ratingText: {
    color: colors.rating,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  ratingCount: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xs,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rankLabel: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.sansSemibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rankNumber: {
    color: colors.foreground,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  sortRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sortBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtnActive: {
    backgroundColor: colors.primary + "22",
    borderColor: colors.primary,
  },
  sortText: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sansSemibold,
  },
  sortTextActive: {
    color: colors.primary,
  },
  reviewCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  reviewUsername: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sansSemibold,
  },
  reviewDisplayName: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xxs,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reviewRatingText: {
    color: colors.rating,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.monoBold,
    fontVariant: ["tabular-nums"],
  },
  reviewNotes: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  reviewDate: {
    color: colors.foregroundMuted,
    fontSize: fontSize.xxs,
    fontFamily: fontFamily.mono,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing["3xl"],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
    textAlign: "center",
  },
  emptySub: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
