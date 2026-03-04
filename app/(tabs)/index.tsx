import React, { useCallback } from "react";
import { View, FlatList, Text, StyleSheet, ListRenderItem } from "react-native";
import { useRouter } from "expo-router";
import { useBacklog } from "../../src/features/backlog/useBacklog";
import { useUIStore } from "../../src/store/ui.store";
import GameCard from "../../src/components/GameCard";
import FilterBar from "../../src/components/FilterBar";
import { GameEntry } from "../../src/types/game";
import { colors, spacing } from "../../src/constants/theme";

const CARD_HEIGHT = 95 + 16; // cover height + margins

export default function BacklogScreen() {
  const router = useRouter();
  const { activeFilter, setFilter } = useUIStore();
  const { games } = useBacklog(activeFilter);

  const handlePress = useCallback(
    (item: GameEntry) => {
      router.push(`/game/${item.id}`);
    },
    [router],
  );

  const renderItem: ListRenderItem<GameEntry> = useCallback(
    ({ item }) => <GameCard item={item} onPress={handlePress} />,
    [handlePress],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <FilterBar active={activeFilter} onChange={setFilter} />
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={12}
        contentContainerStyle={
          games.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your backlog is empty.</Text>
            <Text style={styles.emptySub}>
              Go to Discover to add your first game.
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
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});
