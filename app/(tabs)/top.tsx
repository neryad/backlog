import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, spacing } from "../../src/constants/theme";
import { fontFamily, fontSize } from "../../src/constants/typography";
import {
  useCommunityRanking,
  type CommunityRankingRow,
} from "../../src/features/top/useCommunityRanking";
import { RankingListItem } from "../../src/features/top/RankingListItem";

export default function TopScreen() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useCommunityRanking();

  const handlePress = useCallback((igdbId: number) => {
    router.push(`/community/game/${igdbId}`);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CommunityRankingRow }) => (
      <RankingListItem row={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color={colors.foregroundMuted}
        />
        <Text style={styles.errorTitle}>No connection</Text>
        <Text style={styles.errorSub}>
          The ranking requires internet. Check your connection and try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Top</Text>
        <Text style={styles.subtitle}>
          Games with 3+ public ratings
        </Text>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.igdb_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="trophy-outline"
              size={48}
              color={colors.foregroundMuted}
            />
            <Text style={styles.emptyTitle}>
              No ranking available yet
            </Text>
            <Text style={styles.emptySub}>
              We need at least 3 public ratings for a game to appear here.
              Be the first to rate one!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    color: colors.foreground,
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize["3xl"],
  },
  subtitle: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  list: {
    paddingBottom: spacing.xl,
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
  errorTitle: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
  },
  errorSub: {
    color: colors.foregroundMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
